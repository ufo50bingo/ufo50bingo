import { useCallback, useState } from "react";
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
  changes: ReadonlyArray<Change>;
  startTime: number;
};

const SPEED_MULT_OPTIONS = [1, 2, 4, 8, 16, 32];

export default function WatchBoard({ finalBoard, changes, startTime }: Props) {
  const maxSeekSec = Math.max(changes[changes.length - 1].time - startTime, 0);
  const hasHours = maxSeekSec >= 60 * 60;
  const [seekSec, setSeekSec] = useState(maxSeekSec);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMult, setSpeedMult] = useLocalNumber({
    key: "playback-mult",
    defaultValue: 16,
  });

  const getTime = useCallback(
    (secs: number) => getDurationText(secs * 1000, false, hasHours),
    [hasHours],
  );

  return (
    <Stack>
      <InProgressBoard
        finalBoard={finalBoard}
        changes={changes}
        startTime={startTime}
        seekMs={seekSec}
      />
      <Group gap={8}>
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
            <Button size="compact-xs">{speedMult}x</Button>
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
      </Group>
    </Stack>
  );
}
