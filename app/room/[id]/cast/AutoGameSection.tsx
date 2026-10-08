import {
  Accordion,
  ActionIcon,
  Alert,
  Button,
  Checkbox,
  Group,
  List,
  Paper,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconCamera, IconPlus, IconX } from "@tabler/icons-react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import useLocalBool from "@/app/localStorage/useLocalBool";
import CaptureRegionSelectionModal, {
  CaptureRegion,
  CropRect,
  createRegion,
  getNextPlayerNum,
  getPlayerCount,
  getPlayerLabel,
} from "./CaptureRegionSelectionModal";
import { GAME_NAMES, ProperGame } from "@/app/goals";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { startGameDetection } from "./gamedetector/browser";
import { GameDetection, RewardIconDetection } from "./gamedetector/detector";
import { RewardIconResult } from "./gamedetector/rewardIcon/detect";
import { RewardIcon } from "./gamedetector/rewardIcon/model";
import { FrameResult } from "./gamedetector/types";
import getGamesForPlayer from "./getGamesForPlayer";
import { AllPlayerGames, CountChange } from "./useSyncedState";
import { GeneralItem } from "./Cast";
import { GeneralCounts } from "./CastPage";
import { GameToGoals } from "./findAllGames";

const AUTO_GAME_DEBUG = false;

export type SnapshotInfo = {
  url: string;
  width: number;
  height: number;
};

type Capture = {
  id: string;
  stream: MediaStream;
  video: HTMLVideoElement;
  regions: ReadonlyArray<CaptureRegion>;
};

type Props = {
  numPlayers: number;
  leftColor: BingosyncColor;
  rightColor: BingosyncColor;
  allPlayerGames: AllPlayerGames;
  addGame: (newGame: null | string, playerNum: number) => unknown;
  isDetecting: boolean;
  setIsDetecting: (newIsDetecting: boolean) => unknown;
  generalGoals: ReadonlyArray<GeneralItem>;
  generalCounts: GeneralCounts;
  gameToGoals: GameToGoals;
  setGeneralGameCount: (change: CountChange) => unknown;
};

export default function AutoGameSection({
  numPlayers,
  leftColor,
  rightColor,
  allPlayerGames,
  addGame,
  isDetecting,
  setIsDetecting,
  generalGoals,
  generalCounts,
  gameToGoals,
  setGeneralGameCount,
}: Props) {
  const [captures, setCaptures] = useState<ReadonlyArray<Capture>>([]);
  const [editing, setEditing] = useState<null | {
    captureId: string;
    snapshotInfo: SnapshotInfo;
    initialRegions: ReadonlyArray<CaptureRegion>;
  }>(null);
  const [detections, setDetections] = useState<{
    [regionId: string]: null | GameDetection;
  }>({});
  const [statuses, setStatuses] = useState<{ [regionId: string]: string }>({});
  const [icons, setIcons] = useState<{ [regionId: string]: null | RewardIcon }>(
    {},
  );
  const [shouldAutoTrack, setShouldAutoTrack] = useLocalBool({
    key: "auto-track-rewards",
    defaultValue: true,
  });
  const sentGamesRef = useRef(
    new Map<number, { game: null | string; allPlayerGames: AllPlayerGames }>(),
  );

  const allRegions = captures.flatMap((capture) => capture.regions);
  const nextPlayerNum = getNextPlayerNum(allRegions);
  const playerCount = getPlayerCount(numPlayers, allRegions);
  const editingCapture = captures.find(
    (capture) => capture.id === editing?.captureId,
  );
  const isDetectionButtonDisabled = !isDetecting && allRegions.length === 0;


  const setRegions = (
    captureId: string,
    newRegions: ReadonlyArray<CaptureRegion>,
  ) =>
    setCaptures((oldCaptures) =>
      oldCaptures.map((capture) =>
        capture.id === captureId ? { ...capture, regions: newRegions } : capture,
      ),
    );

  const updateCurrentGame = (game: null | ProperGame, playerNum: number) => {
    const sent = sentGamesRef.current.get(playerNum);
    const currentGame =
      sent != null && sent.allPlayerGames === allPlayerGames
        ? sent.game
        : (getGamesForPlayer(allPlayerGames, playerNum)[0]?.game ?? null);
    if (game === currentGame) {
      return;
    }
    sentGamesRef.current.set(playerNum, { game, allPlayerGames });
    addGame(game, playerNum);
  };

  const clearIcon = (regionId: string) =>
    setIcons((oldIcons) =>
      oldIcons[regionId] == null ? oldIcons : { ...oldIcons, [regionId]: null },
    );

  const checkGeneralGoals = (icon: RewardIcon, playerNum: number) => {
    if (!shouldAutoTrack) {
      return;
    }
    // only the first two players are tracked in general goals for now
    if (playerNum > 1) {
      return;
    }
    const game = getGamesForPlayer(allPlayerGames, playerNum).find(
      (entry) => entry.game != null,
    )?.game;
    if (game == null) {
      return;
    }
    // using the special $gift/$gold/$cherry option lists because
    // they will be reused across all pastas that have gifts/golds/cherries.
    // it's a bit of an abuse of the value
    const relevantGenerals =
      icon === "gift"
        ? ["$gift"]
        : icon === "gold"
          ? ["$gold"]
          : ["$cherry", "$gold"];
    for (const { foundGoal } of generalGoals) {
      const { cast, resolvedGoal } = foundGoal;
      if (
        typeof cast.options !== "string" ||
        !relevantGenerals.includes(cast.options)
      ) {
        continue;
      }
      if (cast.on_card_only) {
        const isOnCard = (gameToGoals[game] ?? []).some(
          ([goal]) => goal !== resolvedGoal,
        );
        if (!isOnCard) {
          continue;
        }
      }
      const isChecked =
        (generalCounts[resolvedGoal]?.[playerNum]?.[game] ?? 0) > 0;
      if (!isChecked) {
        setGeneralGameCount({
          goal: resolvedGoal,
          player_num: playerNum,
          game,
          count: 1,
        });
      }
    }
  };

  // Starts with a pending region to place when the capture doesn't have any
  const openEditor = (capture: Capture) => {
    const snapshotInfo = takeSnapshot(capture.video);
    const aspectRatio = snapshotInfo.width / snapshotInfo.height;
    setEditing({
      captureId: capture.id,
      snapshotInfo,
      initialRegions:
        capture.regions.length > 0
          ? capture.regions
          : [createRegion(nextPlayerNum, 0, aspectRatio)],
    });
  };

  const removeCapture = (capture: Capture) => {
    capture.stream.getTracks().forEach((track) => track.stop());
    setCaptures((oldCaptures) =>
      oldCaptures.filter((c) => c.id !== capture.id),
    );
  };

  const addCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: 30,
        },
        audio: false,
      });
      const video = document.createElement("video");
      video.srcObject = stream;
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });
      await video.play();
      const capture: Capture = {
        id: crypto.randomUUID(),
        stream,
        video,
        regions: [],
      };
      stream
        .getVideoTracks()
        .forEach((track) =>
          track.addEventListener("ended", () => removeCapture(capture)),
        );
      setCaptures((oldCaptures) => [...oldCaptures, capture]);
      openEditor(capture);
    } catch (err) {
      console.error(`Error: ${err}`);
    }
  };

  return (
    <Accordion.Item value="autogame">
      <Accordion.Control>Auto Detection</Accordion.Control>
      {isDetecting &&
        captures.flatMap((capture) =>
          capture.regions.map((region) => (
            <RegionDetector
              key={region.id}
              video={capture.video}
              cropRect={region.cropRect}
              onFrame={(result, ms, icon) => {
                if (result.kind === "library") {
                  setDetections((oldDetections) =>
                    oldDetections[region.id] == null
                      ? oldDetections
                      : { ...oldDetections, [region.id]: null },
                  );
                  clearIcon(region.id);
                  updateCurrentGame(null, region.playerNum);
                }
                if (AUTO_GAME_DEBUG) {
                  setStatuses((oldStatuses) => ({
                    ...oldStatuses,
                    [region.id]: `${describe(result)}${describeIcon(icon)} (${ms.toFixed(0)} ms)`,
                  }));
                }
              }}
              onDetection={(detection) => {
                setDetections((oldDetections) => ({
                  ...oldDetections,
                  [region.id]: detection,
                }));
                clearIcon(region.id);
                updateCurrentGame(detection.game, region.playerNum);
              }}
              onRewardIcon={(detection) => {
                setIcons((oldIcons) => ({
                  ...oldIcons,
                  [region.id]: detection.icon,
                }));
                checkGeneralGoals(detection.icon, region.playerNum);
              }}
            />
          )),
        )}
      <Accordion.Panel>
        <Stack>
          <Alert>
            Share your Discord window, then choose regions displaying each player's stream.
            <List>
              <List.Item><Text size="sm">If you are popping out the streams, add a capture for each popout, and add one region per capture.</Text></List.Item>
              <List.Item><Text size="sm">If you are not popping out the streams, add a single capture of Discord, then add a region for each player.</Text></List.Item>
            </List>
          </Alert>
          {captures.map((capture, index) => (
            <Paper key={capture.id} withBorder={true} p="xs">
              <Stack gap="xs">
                <Group justify="space-between" wrap="nowrap">
                  <Text fw={500}>Capture {index + 1}</Text>
                  <Tooltip label="Stop capture">
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      aria-label="Stop capture"
                      onClick={() => removeCapture(capture)}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
                {capture.regions.length === 0 && (
                  <Text size="sm" c="dimmed">
                    No regions chosen
                  </Text>
                )}
                {capture.regions.map((region) => {
                  const detected = detections[region.id];
                  const status = statuses[region.id];
                  const icon = icons[region.id];
                  return (
                    <div key={region.id}>
                      <Group justify="space-between" wrap="nowrap">
                        <Text size="sm" fw={500}>
                          {getPlayerLabel(region.playerNum, playerCount)}
                          {detected != null &&
                            ` - ${GAME_NAMES[detected.game]}`}
                          {icon != null && ` (${icon})`}
                        </Text>
                        {AUTO_GAME_DEBUG && (
                          <Tooltip label="Copy screenshot of region">
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              aria-label="Copy screenshot of region"
                              onClick={() =>
                                copyScreenshot(capture.video, region.cropRect)
                              }
                            >
                              <IconCamera size={16} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </Group>
                      {AUTO_GAME_DEBUG && isDetecting && status != null && (
                        <Text size="xs" c="dimmed">
                          {status}
                        </Text>
                      )}
                    </div>
                  );
                })}
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => openEditor(capture)}
                >
                  Choose regions
                </Button>
              </Stack>
            </Paper>
          ))}
          <Button leftSection={<IconPlus size={16} />} onClick={addCapture}>
            Add capture
          </Button>
          <Tooltip
            label="Detection will also be enabled automatically when starting the match if at least one region is selected"
          >
            <Button
              disabled={isDetectionButtonDisabled}
              onClick={() => {
                setIsDetecting(!isDetecting);
              }}
            >
              {isDetecting ? "Stop detection" : "Start detection"}
            </Button>
          </Tooltip>
          <Checkbox
            label="Automatically track gift/gold/cherry checkboxes"
            checked={shouldAutoTrack}
            onChange={(event) => setShouldAutoTrack(event.target.checked)}
          />
        </Stack>
        {editing != null && editingCapture != null && (
          <CaptureRegionSelectionModal
            snapshotInfo={editing.snapshotInfo}
            initialRegions={editing.initialRegions}
            otherRegions={captures
              .filter((capture) => capture.id !== editingCapture.id)
              .flatMap((capture) => capture.regions)}
            numPlayers={numPlayers}
            leftColor={leftColor}
            rightColor={rightColor}
            onConfirm={(newRegions) => {
              setRegions(editingCapture.id, newRegions);
              setEditing(null);
            }}
            onClose={() => setEditing(null)}
          />
        )}
      </Accordion.Panel>
    </Accordion.Item>
  );
}

type RegionDetectorProps = {
  video: HTMLVideoElement;
  cropRect: CropRect;
  onFrame: (
    result: FrameResult,
    elapsedMs: number,
    icon: RewardIconResult | null,
  ) => void;
  onDetection: (detection: GameDetection) => void;
  onRewardIcon: (detection: RewardIconDetection) => void;
};

// runs the detector on one region of a capture for as long as it's mounted
function RegionDetector({
  video,
  cropRect,
  onFrame,
  onDetection,
  onRewardIcon,
}: RegionDetectorProps) {
  const { x, y, width, height } = cropRect;
  const onFrameEvent = useEffectEvent(onFrame);
  const onDetectionEvent = useEffectEvent(onDetection);
  const onRewardIconEvent = useEffectEvent(onRewardIcon);

  useEffect(
    () =>
      startGameDetection(
        video,
        () => ({
          x: x * video.videoWidth,
          y: y * video.videoHeight,
          width: width * video.videoWidth,
          height: height * video.videoHeight,
        }),
        (detection) => onDetectionEvent(detection),
        {
          onFrame: (result, ms, icon) => onFrameEvent(result, ms, icon),
          onRewardIcon: (detection) => onRewardIconEvent(detection),
        },
      ),
    [video, x, y, width, height],
  );

  return null;
}

function describe(result: FrameResult): string {
  if (result.kind === "terminal") {
    return `terminal: ${result.text}${result.game != null ? ` -> ${GAME_NAMES[result.game]}` : ""}`;
  }
  if (result.kind === "library") {
    return `library: ${result.carts} carts`;
  }
  if (result.kind !== "cart") {
    return result.kind;
  }
  if (result.game != null) {
    return `cartridge: ${GAME_NAMES[result.game]}`;
  }
  return result.cobwebbed ? "cartridge (cobwebbed)" : "cartridge (unsure)";
}

function describeIcon(icon: RewardIconResult | null): string {
  if (icon == null) {
    return "";
  }
  const match = `${icon.icon} ${icon.score.toFixed(2)}`;
  return icon.found ? `, ${match}` : `, no icon (${match})`;
}

function drawFrame(video: HTMLVideoElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function takeSnapshot(video: HTMLVideoElement): SnapshotInfo {
  const canvas = drawFrame(video);
  return {
    url: canvas.toDataURL(),
    width: canvas.width,
    height: canvas.height,
  };
}

function copyScreenshot(video: HTMLVideoElement, cropRect: CropRect) {
  cropCanvas(drawFrame(video), cropRect).toBlob((blob) => {
    if (blob == null) {
      return;
    }
    const board = new ClipboardItem({ "image/png": blob });
    navigator.clipboard.write([board]);
  });
}

function cropCanvas(canvas: HTMLCanvasElement, cropRect: CropRect) {
  const cropX = cropRect.x * canvas.width;
  const cropY = cropRect.y * canvas.height;
  const cropW = cropRect.width * canvas.width;
  const cropH = cropRect.height * canvas.height;

  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = cropW;
  cropCanvas.height = cropH;
  cropCanvas
    .getContext("2d")!
    .drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  return cropCanvas;
}
