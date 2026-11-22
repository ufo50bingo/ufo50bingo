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
import { SnapshotInfo } from "./AutoGameSection";
import getColorHex from "./getColorHex";
import { PlayerMember } from "../common/useMembers";

export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CaptureRegion = {
  id: string;
  userId: number;
  cropRect: CropRect;
};

function createRegion(
  userId: number,
  index: number,
  aspectRatio: number,
): CaptureRegion {
  const height = Math.min(0.45, 0.4 * (9 / 16) * aspectRatio);
  return {
    id: crypto.randomUUID(),
    userId,
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
  nextPlayerId: number,
): ReadonlyArray<CaptureRegion> {
  const region = createRegion(nextPlayerId, regions.length, aspectRatio);
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
  players: ReadonlyArray<PlayerMember>;
  onConfirm: (newRegions: ReadonlyArray<CaptureRegion>) => unknown;
  onClose: () => unknown;
};

export default function CaptureRegionSelectionModal({
  snapshotInfo,
  initialRegions,
  otherRegions,
  suggestions,
  players,
  onConfirm,
  onClose,
}: Props) {
  const [regions, setRegions] = useState(initialRegions);
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

  const playerOptions = players.map((player) => ({
    value: player.userId.toString(),
    label: player.name,
  }));
  const getPlayer = (userId: number) =>
    players.find((p) => p.userId === userId);

  const nextPlayer = players.find((p) =>
    regions.every((r) => r.userId !== p.userId),
  );

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
                  color={getColorHex(getPlayer(region.userId)?.color ?? "red")}
                  size={14}
                />
              }
              data={playerOptions}
              allowDeselect={false}
              w={170}
              value={String(region.userId)}
              onChange={(newValue) => {
                if (newValue == null) {
                  return;
                }
                updateRegion(region.id, { userId: Number(newValue) });
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
          disabled={nextPlayer == null}
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            if (nextPlayer != null) {
              setRegions(
                addRegion(
                  regions,
                  otherRegions,
                  suggestions,
                  snapshotInfo.width / snapshotInfo.height,
                  nextPlayer.userId,
                ),
              );
            }
          }}
        >
          Add region
        </Button>
        <Button ml="auto" variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => onConfirm(regions)}>Done</Button>
      </Group>
      <div style={{ position: "relative", display: "inline-block" }}>
        <img
          ref={imgCallback}
          src={snapshotInfo.url}
          style={{ display: "block", maxWidth: "100%" }}
          alt="screenshot"
        />

        {imgSize != null &&
          regions.map((region) => {
            const player = getPlayer(region.userId);
            const color = getColorHex(player?.color ?? "red");
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
                  {player?.name ?? region.userId}
                </Badge>
              </Rnd>
            );
          })}
      </div>
    </Modal>
  );
}
