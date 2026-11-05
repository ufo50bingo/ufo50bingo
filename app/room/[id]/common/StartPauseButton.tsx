import { Button, Popover, Stack, Text } from "@mantine/core";
import { SyncedTimerState } from "./useSyncedTimer";
import { useServerOffsetContext } from "../ServerOffsetContext";
import { IconPlayerPlay, IconPlayerPause } from "@tabler/icons-react";
import { FeedTimerEvent, NewFeedItem } from "@/app/fetchFeed";

type Props = {
  timerState: SyncedTimerState;
  isCast: boolean;
  userId: number;
  onCountdownStart?: () => void;
  sendEvents: (newEvent: ReadonlyArray<NewFeedItem>) => Promise<boolean>;
};

export default function StartPauseButton({
  timerState,
  isCast,
  userId,
  onCountdownStart,
  sendEvents,
}: Props) {
  const { getServerMsFromClientMs } = useServerOffsetContext();

  const position = isCast ? "bottom-start" : "bottom-end";

  const timerType = timerState.type;
  switch (timerType) {
    case "not_started":
      return (
        <Popover
          key="not_started"
          width={320}
          position={position}
          withArrow
          shadow="md"
        >
          <Popover.Target>
            <Button leftSection={<IconPlayerPlay />}>Start</Button>
          </Popover.Target>
          <Popover.Dropdown>
            <Stack>
              <Text>
                Players will see a 5-second countdown, then the board will be
                revealed. Once the timer reaches 0:00, players should start
                playing!
                <br />
                <br />
                Are you sure you want to start the match?
                {!isCast && (
                  <>
                    <br />
                    <br />
                    If your match has a caster,{" "}
                    <strong>let them start the match instead!</strong>
                  </>
                )}
              </Text>
              <Button
                color="green"
                onClick={async () => {
                  onCountdownStart?.();
                  const event: FeedTimerEvent = {
                    type: "timer_event",
                    userId,
                    time: getServerMsFromClientMs(Date.now() + 6000) / 1000,
                    event: "start",
                    duration: null,
                  };
                  await sendEvents([event]);
                }}
              >
                Confirm Start
              </Button>
            </Stack>
          </Popover.Dropdown>
        </Popover>
      );
    case "paused":
      return (
        <Popover
          key="paused"
          width={320}
          position={position}
          withArrow
          shadow="md"
        >
          <Popover.Target>
            <Button leftSection={<IconPlayerPlay />}>Resume</Button>
          </Popover.Target>
          <Popover.Dropdown>
            <Stack>
              <Text>
                Players will see a 5-second countdown. When the countdown is
                finished, players should immediately resume play!
                <br />
                <br />
                Are you sure you want to resume the match?
                {!isCast && (
                  <>
                    <br />
                    <br />
                    If your match has a caster,{" "}
                    <strong>let them resume the match instead!</strong>
                  </>
                )}
              </Text>
              <Button
                color="green"
                onClick={async () => {
                  onCountdownStart?.();
                  const event: FeedTimerEvent = {
                    type: "timer_event",
                    userId,
                    time: getServerMsFromClientMs(Date.now() + 6000) / 1000,
                    event: "start",
                    duration: null,
                  };
                  await sendEvents([event]);
                }}
              >
                Confirm Resume
              </Button>
            </Stack>
          </Popover.Dropdown>
        </Popover>
      );
    case "countdown":
      // TODO: Maybe add support for canceling countdown?
      return (
        <Button disabled={true} leftSection={<IconPlayerPause />}>
          Pause
        </Button>
      );
    case "running":
      return (
        <Popover
          key="running"
          width={320}
          position={position}
          withArrow
          shadow="md"
        >
          <Popover.Target>
            <Button leftSection={<IconPlayerPause />}>Pause</Button>
          </Popover.Target>
          <Popover.Dropdown>
            <Stack>
              <Text>Are you sure you want to pause the match?</Text>
              <Button
                color="green"
                onClick={async () => {
                  const event: FeedTimerEvent = {
                    type: "timer_event",
                    userId,
                    time: getServerMsFromClientMs(Date.now()) / 1000,
                    event: "pause",
                    duration: null,
                  };
                  await sendEvents([event]);
                }}
              >
                Confirm Pause
              </Button>
            </Stack>
          </Popover.Dropdown>
        </Popover>
      );
    default:
      timerType satisfies never;
      return (
        <Button disabled={true} leftSection={<IconPlayerPlay />}>
          Start
        </Button>
      );
  }
}
