import { Accordion, Button, Group, Modal, Stack, Text } from "@mantine/core";
import { useState } from "react";
import DurationInput from "./DurationInput";
import { FullSyncedTimerEvent, SyncedTimerState } from "./useSyncedTimer";
import { useServerOffsetContext } from "../ServerOffsetContext";
import { useParams } from "next/navigation";

interface Props {
  timerState: SyncedTimerState;
  addEvent: (newEvent: FullSyncedTimerEvent) => unknown;
  isMobile: boolean;
  seed: number;
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
  timerState,
  close,
  isMobile,
  addEvent,
  seed,
}: ModalProps) {
  const { id } = useParams<{ id: string }>();
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
              await addEvent({
                room_id: id,
                seed: seed,
                time: getServerMsFromClientMs(Date.now()),
                event: "set_duration",
                duration: accumulatedDuration,
              });
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
