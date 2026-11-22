import { useCallback, useEffect, useRef, useState } from "react";
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
import { screenshotHiddenProps, screenshotOnlyProps } from "./screenshotHidden";

type Props = {
  seekSec: number;
  setSeekSec: (newSeekSec: number) => void;
  maxSeekSec: number;
};

const SPEED_MULT_OPTIONS = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];
const STEP_SEC = 1;

export default function MatchPlaybackSlider({
  seekSec,
  setSeekSec,
  maxSeekSec,
}: Props) {
  const hasHours = maxSeekSec >= 60 * 60;
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
  // latest seek position, so the animation loop can advance it without
  // calling setState inside another component's state updater
  const seekSecRef = useRef(seekSec);
  useEffect(() => {
    seekSecRef.current = seekSec;
  }, [seekSec]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const tick = (timestampMs: number) => {
      if (lastFrameRef.current != null) {
        const delta = (timestampMs - lastFrameRef.current) / 1000;
        const newSeekSec = Math.min(
          seekSecRef.current + delta * speedMult,
          maxSeekSec,
        );
        seekSecRef.current = newSeekSec;
        setSeekSec(newSeekSec);
        if (newSeekSec >= maxSeekSec) {
          setIsPlaying(false);
          return;
        }
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
  }, [isPlaying, maxSeekSec, setSeekSec, speedMult]);

  // the slider snaps to increments of 1s, so the max value of the slider
  // must be equal to maxSeekSec rounded up
  const sliderMax = Math.ceil(maxSeekSec);
  const sliderValue = seekSec >= maxSeekSec ? sliderMax : seekSec;
  const onSliderChange = (value: number) =>
    setSeekSec(Math.min(value, maxSeekSec));
  const getSliderLabel = (value: number) =>
    getTime(Math.min(value, maxSeekSec));

  const timeText = (
    <Text size="xs" style={{ fontVariantNumeric: "tabular-nums" }}>
      {getTime(seekSec)}/{getTime(maxSeekSec)}
    </Text>
  );

  return (
    <div style={{ position: "relative" }}>
      <Group gap={8} wrap="nowrap" {...screenshotHiddenProps}>
        <ActionIcon
          size="sm"
          onClick={() => {
            if (isPlaying) {
              setIsPlaying(false);
            } else {
              if (seekSec >= maxSeekSec) {
                seekSecRef.current = 0;
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
            <Button size="compact-xs" w="48px">
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
        {timeText}
        <Slider
          min={0}
          max={sliderMax}
          label={getSliderLabel}
          value={sliderValue}
          onChange={onSliderChange}
          step={STEP_SEC}
          styles={{ markLabel: { display: "none" } }}
          flex="1"
        />
      </Group>
      {/* dummy slider to make sure that in screenshots the slider uses the full width */}
      <Group
        gap={8}
        wrap="nowrap"
        {...screenshotOnlyProps}
        inert={true}
        style={{ position: "absolute", inset: 0, opacity: 0 }}
      >
        {timeText}
        <Slider
          min={0}
          max={sliderMax}
          label={null}
          value={sliderValue}
          step={STEP_SEC}
          styles={{ markLabel: { display: "none" } }}
          flex="1"
        />
      </Group>
    </div>
  );
}
