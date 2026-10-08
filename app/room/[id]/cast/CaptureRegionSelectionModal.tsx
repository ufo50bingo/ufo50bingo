import { Rnd } from "react-rnd";
import {
  ActionIcon,
  Badge,
  Button,
  ColorSwatch,
  Group,
  Modal,
  rgba,
  Select,
  Tooltip,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useState, useCallback } from "react";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { SnapshotInfo } from "./AutoGameSection";
import getColorHex from "./getColorHex";

export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CaptureRegion = {
  id: string;
  playerNum: number;
  cropRect: CropRect;
};

export function getPlayerLabel(playerNum: number, playerCount: number): string {
  const side = playerNum % 2 === 0 ? "Left" : "Right";
  return playerCount < 3
    ? `${side} player`
    : `${side} player ${Math.floor(playerNum / 2) + 1}`;
}

function getNextPlayerNum(regions: ReadonlyArray<CaptureRegion>): number {
  let playerNum = 0;
  while (regions.some((region) => region.playerNum === playerNum)) {
    playerNum++;
  }
  return playerNum;
}

export function getPlayerCount(
  numPlayers: number,
  regions: ReadonlyArray<CaptureRegion>,
): number {
  return Math.max(numPlayers, ...regions.map((region) => region.playerNum + 1));
}

function createRegion(
  playerNum: number,
  index: number,
  aspectRatio: number,
): CaptureRegion {
  const height = Math.min(0.45, 0.4 * (9 / 16) * aspectRatio);
  return {
    id: crypto.randomUUID(),
    playerNum,
    cropRect: {
      x: 0.05 + 0.5 * (index % 2),
      y: 0.05 + 0.5 * (Math.floor(index / 2) % 2),
      width: ((16 / 9) * height) / aspectRatio,
      height,
    },
  };
}

// Adds a region for the next free player, on the first suggestion that no
// region covers yet
export function addRegion(
  regions: ReadonlyArray<CaptureRegion>,
  otherRegions: ReadonlyArray<CaptureRegion>,
  suggestions: ReadonlyArray<CropRect>,
  aspectRatio: number,
): ReadonlyArray<CaptureRegion> {
  const region = createRegion(
    getNextPlayerNum([...otherRegions, ...regions]),
    regions.length,
    aspectRatio,
  );
  const cropRect = suggestions.find((suggestion) =>
    regions.every((r) => !overlaps(r.cropRect, suggestion)),
  );
  return [...regions, cropRect == null ? region : { ...region, cropRect }];
}

function overlaps(a: CropRect, b: CropRect): boolean {
  return (
    a.x < b.x + b.width &&
    b.x < a.x + a.width &&
    a.y < b.y + b.height &&
    b.y < a.y + a.height
  );
}

type Props = {
  snapshotInfo: SnapshotInfo;
  initialRegions: ReadonlyArray<CaptureRegion>;
  // Regions of the other captures, for picking players
  otherRegions: ReadonlyArray<CaptureRegion>;
  // Likely game screens in the snapshot, for placing new regions
  suggestions: ReadonlyArray<CropRect>;
  numPlayers: number;
  leftColor: BingosyncColor;
  rightColor: BingosyncColor;
  onConfirm: (newRegions: ReadonlyArray<CaptureRegion>) => unknown;
  onClose: () => unknown;
};

export default function CaptureRegionSelectionModal({
  snapshotInfo,
  initialRegions,
  otherRegions,
  suggestions,
  numPlayers,
  leftColor,
  rightColor,
  onConfirm,
  onClose,
}: Props) {
  const [regions, setRegions] = useState(initialRegions);
  const playerCount = getPlayerCount(numPlayers, [...otherRegions, ...regions]);
  const [imgSize, setImgSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const imgCallback = useCallback((img: HTMLImageElement | null) => {
    if (!img) return;

    const measure = () => {
      setImgSize({ width: img.clientWidth, height: img.clientHeight });
    };

    const observer = new ResizeObserver(measure);
    observer.observe(img);

    if (img.complete) {
      measure();
    } else {
      img.addEventListener("load", measure);
    }
    return () => observer.disconnect();
  }, []);

  const updateRegion = (id: string, changes: Partial<CaptureRegion>) =>
    setRegions(
      regions.map((region) =>
        region.id === id ? { ...region, ...changes } : region,
      ),
    );

  const playerOptions = new Array(playerCount)
    .fill(null)
    .map((_, playerNum) => ({
      value: String(playerNum),
      label: getPlayerLabel(playerNum, playerCount),
    }));
  const getPlayerColor = (playerNum: number) =>
    getColorHex(playerNum % 2 === 0 ? leftColor : rightColor);

  return (
    <Modal
      fullScreen={true}
      onClose={onClose}
      opened={true}
      size="xl"
      withCloseButton={true}
      title="Choose regions"
    >
      <Group mb="md">
        {regions.map((region) => (
          <Group key={region.id} gap={4} wrap="nowrap">
            <Select
              aria-label="Player"
              leftSection={
                <ColorSwatch
                  color={getPlayerColor(region.playerNum)}
                  size={14}
                />
              }
              data={playerOptions}
              allowDeselect={false}
              w={170}
              value={String(region.playerNum)}
              onChange={(newValue) => {
                if (newValue == null) {
                  return;
                }
                updateRegion(region.id, { playerNum: Number(newValue) });
              }}
            />
            <Tooltip label="Remove region">
              <ActionIcon
                variant="subtle"
                color="gray"
                aria-label="Remove region"
                onClick={() =>
                  setRegions(regions.filter((r) => r.id !== region.id))
                }
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        ))}
        <Button
          variant="light"
          leftSection={<IconPlus size={16} />}
          onClick={() =>
            setRegions(
              addRegion(
                regions,
                otherRegions,
                suggestions,
                snapshotInfo.width / snapshotInfo.height,
              ),
            )
          }
        >
          Add region
        </Button>
        <Button ml="auto" variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => onConfirm(regions)}>Done</Button>
      </Group>
      <div style={{ position: "relative", display: "inline-block" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgCallback}
          src={snapshotInfo.url}
          style={{ display: "block", maxWidth: "100%" }}
          alt="screenshot"
        />

        {imgSize != null &&
          regions.map((region) => {
            const color = getPlayerColor(region.playerNum);
            const position = {
              x: region.cropRect.x * imgSize.width,
              y: region.cropRect.y * imgSize.height,
            };
            return (
              <Rnd
                key={region.id}
                lockAspectRatio={16 / 9}
                size={{
                  width: region.cropRect.width * imgSize.width,
                  height: region.cropRect.height * imgSize.height,
                }}
                position={position}
                bounds="parent"
                onDragStop={(e, d) => {
                  // Clicks end a drag too, and any change to a region
                  // restarts its detector, so ignore sub-pixel moves
                  if (
                    Math.abs(d.x - position.x) < 1 &&
                    Math.abs(d.y - position.y) < 1
                  ) {
                    return;
                  }
                  updateRegion(region.id, {
                    cropRect: {
                      ...region.cropRect,
                      x: d.x / imgSize.width,
                      y: d.y / imgSize.height,
                    },
                  });
                }}
                onResizeStop={(e, dir, ref, delta, newPosition) => {
                  if (delta.width === 0 && delta.height === 0) {
                    return;
                  }
                  updateRegion(region.id, {
                    cropRect: {
                      x: newPosition.x / imgSize.width,
                      y: newPosition.y / imgSize.height,
                      width: parseInt(ref.style.width) / imgSize.width,
                      height: parseInt(ref.style.height) / imgSize.height,
                    },
                  });
                }}
                style={{
                  border: `2px solid ${color}`,
                  background: rgba(color, 0.15),
                }}
              >
                <Badge color={color} autoContrast={true} radius={0}>
                  {getPlayerLabel(region.playerNum, playerCount)}
                </Badge>
              </Rnd>
            );
          })}
      </div>
    </Modal>
  );
}
