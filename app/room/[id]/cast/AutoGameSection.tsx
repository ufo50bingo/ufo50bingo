import {
  Accordion,
  ActionIcon,
  Alert,
  Button,
  Group,
  List,
  Paper,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconCamera, IconPlus, IconX } from "@tabler/icons-react";
import { useState } from "react";
import CaptureRegionSelectionModal, {
  CaptureRegion,
  CropRect,
  createRegion,
  getPlayerLabel,
} from "./CaptureRegionSelectionModal";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";

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
};

export default function AutoGameSection({
  numPlayers,
  leftColor,
  rightColor,
}: Props) {
  const [captures, setCaptures] = useState<ReadonlyArray<Capture>>([]);
  const [editing, setEditing] = useState<null | {
    captureId: string;
    snapshotInfo: SnapshotInfo;
  }>(null);

  const allRegions = captures.flatMap((capture) => capture.regions);
  const nextPlayerNum = getNextPlayerNum(allRegions);
  const playerCount = Math.max(
    numPlayers,
    ...allRegions.map((region) => region.playerNum + 1),
  );
  const editingCapture = captures.find(
    (capture) => capture.id === editing?.captureId,
  );

  const setRegions = (
    captureId: string,
    newRegions: ReadonlyArray<CaptureRegion>,
  ) =>
    setCaptures((oldCaptures) =>
      oldCaptures.map((capture) =>
        capture.id === captureId ? { ...capture, regions: newRegions } : capture,
      ),
    );

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
        regions: [
          createRegion(nextPlayerNum, 0, video.videoWidth / video.videoHeight),
        ],
      };
      stream
        .getVideoTracks()
        .forEach((track) =>
          track.addEventListener("ended", () => removeCapture(capture)),
        );
      setCaptures((oldCaptures) => [...oldCaptures, capture]);
      setEditing({ captureId: capture.id, snapshotInfo: takeSnapshot(video) });
    } catch (err) {
      console.error(`Error: ${err}`);
    }
  };

  return (
    <Accordion.Item value="autogame">
      <Accordion.Control>Auto Game Detection</Accordion.Control>
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
                {capture.regions.map((region) => (
                  <Group key={region.id} justify="space-between" wrap="nowrap">
                    <Text size="sm" fw={500}>
                      {getPlayerLabel(region.playerNum, playerCount)}
                    </Text>
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
                  </Group>
                ))}
                <Button
                  size="xs"
                  variant="light"
                  onClick={() =>
                    setEditing({
                      captureId: capture.id,
                      snapshotInfo: takeSnapshot(capture.video),
                    })
                  }
                >
                  Choose regions
                </Button>
              </Stack>
            </Paper>
          ))}
          <Button leftSection={<IconPlus size={16} />} onClick={addCapture}>
            Add capture
          </Button>
        </Stack>
        {editing != null && editingCapture != null && (
          <CaptureRegionSelectionModal
            snapshotInfo={editing.snapshotInfo}
            regions={editingCapture.regions}
            setRegions={(newRegions) =>
              setRegions(editingCapture.id, newRegions)
            }
            nextPlayerNum={nextPlayerNum}
            playerCount={playerCount}
            leftColor={leftColor}
            rightColor={rightColor}
            onClose={() => setEditing(null)}
          />
        )}
      </Accordion.Panel>
    </Accordion.Item>
  );
}

function getNextPlayerNum(regions: ReadonlyArray<CaptureRegion>): number {
  let playerNum = 0;
  while (regions.some((region) => region.playerNum === playerNum)) {
    playerNum++;
  }
  return playerNum;
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
