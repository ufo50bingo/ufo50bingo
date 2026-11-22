import { Accordion, Button, Group, Modal, Stack, Text } from "@mantine/core";
import { useState } from "react";
import DurationInput from "./DurationInput";
import { SyncedTimerState } from "./useSyncedTimer";
import { useServerOffsetContext } from "../ServerOffsetContext";
import { FeedTimerEvent, NewFeedItem } from "@/app/fetchFeed";

interface Props {
  timerState: SyncedTimerState;
  isMobile: boolean;
  sendEvents: (newEvent: ReadonlyArray<NewFeedItem>) => Promise<boolean>;
  userId: number;
}

interface ModalProps extends Props {
  close: () => unknown;
}

export default function TimerSection(props: Props) {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <>
      <Accordion.Item value="timer">
        <Accordion.Control>Edit Timer</Accordion.Control>
        <Accordion.Panel>
          <Stack>
            <Text size="sm">
              Edit the current value of the timer.
              <br />
              <br />
              Players are expected to begin playing when the timer hits 0:00, so
              a negative value represents board analysis time.
            </Text>
            <Button onClick={() => setIsEditing(true)}>Edit Timer</Button>
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
      {isEditing && <TimerModal {...props} close={() => setIsEditing(false)} />}
    </>
  );
}

function TimerModal({
  userId,
  timerState,
  close,
  isMobile,
  sendEvents,
}: ModalProps) {
  const { getServerMsFromClientMs } = useServerOffsetContext();
  const [accumulatedDuration, setAccumulatedDuration] = useState<null | number>(
    () =>
      timerState.type === "running"
        ? timerState.accumulatedDuration + Date.now() - timerState.startTime
        : timerState.accumulatedDuration,
  );
  return (
    <Modal
      fullScreen={isMobile}
      centered={true}
      onClose={close}
      opened={true}
      title="Edit Timer"
    >
      <Stack>
        <DurationInput
          label="Current value (hh:mm:ss)"
          onChange={setAccumulatedDuration}
          initialDurationMs={accumulatedDuration ?? 0}
        />
        <Group justify="end">
          <Button onClick={close}>Cancel</Button>
          <Button
            color="green"
            disabled={accumulatedDuration == null}
            onClick={async () => {
              if (accumulatedDuration == null) {
                return;
              }
              const event: FeedTimerEvent = {
                type: "timer_event",
                userId,
                time: getServerMsFromClientMs(Date.now()) / 1000,
                event: "set_duration",
                duration: accumulatedDuration / 1000,
              };
              await sendEvents([event]);
              close();
            }}
          >
            Confirm
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
