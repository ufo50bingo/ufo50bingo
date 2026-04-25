import { useCallback, useEffect, useRef, useState } from "react";
import { TBoard, Change } from "./parseBingosyncData";
import InProgressBoard from "./InProgressBoard";
import {
  ActionIcon,
  Button,
  Group,
  Popover,
  Radio,
  Slider,
  Stack,
  Text,
} from "@mantine/core";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import getDurationText from "../practice/getDurationText";
import useLocalNumber from "../localStorage/useLocalNumber";

type Props = {
  finalBoard: TBoard;
  changes: null | undefined | ReadonlyArray<Change>;
  startTime: null | undefined | number;
  leagueP1: string | null | undefined;
  leagueP2: string | null | undefined;
  isRevealed: boolean;
  playbackId: string;
  matchId: string;
  isBoardVisible: boolean;
  showOverlays: boolean;
};

const SPEED_MULT_OPTIONS = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];

export default function WatchBoard({
  finalBoard,
  changes,
  startTime,
  leagueP1,
  leagueP2,
  isRevealed,
  playbackId,
  matchId,
  isBoardVisible,
  showOverlays,
}: Props) {
  const maxSeekSec =
    changes != null && startTime != null
      ? Math.max(changes[changes.length - 1].time - startTime, 0)
      : 0;
  const hasHours = maxSeekSec >= 60 * 60;
  const [seekSec, setSeekSec] = useState(maxSeekSec);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMult, setSpeedMult] = useLocalNumber({
    key: "playback-mult",
    defaultValue: 128,
  });

  const getTime = useCallback(
    (secs: number) => getDurationText(secs * 1000, false, hasHours),
    [hasHours],
  );

  const lastFrameRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const tick = (timestampMs: number) => {
      if (lastFrameRef.current != null) {
        const delta = (timestampMs - lastFrameRef.current) / 1000;
        setSeekSec((prev) => {
          const newSeekSec = Math.min(prev + delta * speedMult, maxSeekSec);
          if (newSeekSec === maxSeekSec) {
            setIsPlaying(false);
          }
          return newSeekSec;
        });
      }

      lastFrameRef.current = timestampMs;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
      lastFrameRef.current = null;
    };
  }, [isPlaying, maxSeekSec, speedMult]);

  return (
    <>
      <InProgressBoard
        finalBoard={finalBoard}
        changes={changes}
        startTime={startTime}
        seekMs={seekSec}
        leagueP1={leagueP1}
        leagueP2={leagueP2}
        isRevealed={isRevealed}
        matchId={matchId}
        isBoardVisible={isBoardVisible}
        showOverlays={showOverlays}
      />
      {isRevealed &&
        changes != null &&
        startTime != null && (
            <Group gap={8} id={playbackId}>
              <ActionIcon
                size="sm"
                onClick={() => {
                  if (isPlaying) {
                    setIsPlaying(false);
                  } else {
                    if (seekSec === maxSeekSec) {
                      setSeekSec(0);
                    }
                    setIsPlaying(true);
                  }
                }}
              >
                {isPlaying ? (
                  <IconPlayerPause size={12} />
                ) : (
                  <IconPlayerPlay size={12} />
                )}
              </ActionIcon>
              <Popover width={200} position="bottom" withArrow shadow="md">
                <Popover.Target>
                  <Button size="compact-xs" w="42px">
                    {speedMult}x
                  </Button>
                </Popover.Target>
                <Popover.Dropdown w="100px">
                  <Radio.Group
                    value={speedMult.toString()}
                    onChange={(newMult) => setSpeedMult(Number(newMult))}
                  >
                    <Stack>
                      {SPEED_MULT_OPTIONS.map((mult) => (
                        <Radio
                          key={mult}
                          value={mult.toString()}
                          label={`${mult}x`}
                        />
                      ))}
                    </Stack>
                  </Radio.Group>
                </Popover.Dropdown>
              </Popover>
              <Text size="xs" style={{ fontVariantNumeric: "tabular-nums" }}>
                {getTime(seekSec)}/{getTime(maxSeekSec)}
              </Text>
              <Slider
                min={0}
                max={maxSeekSec}
                label={getTime}
                value={seekSec}
                onChange={setSeekSec}
                step={0.1}
                styles={{ markLabel: { display: "none" } }}
                flex="1"
              />
            </Group>,
          )}
    </>
  );
}
