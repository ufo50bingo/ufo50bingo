import { Accordion, Button, Group, Modal, Stack, Text } from "@mantine/core";
import { TimerState } from "./useMatchTimer";
import { useState } from "react";
import DurationInput from "./DurationInput";

interface Props {
  state: TimerState;
  setState: (newState: TimerState) => unknown;
  isMobile: boolean;
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
              The timer will start running as soon as you reveal the board. If
              any player or caster requests a pause, your timer will automatically pause.
            </Text>
            <Button onClick={() => setIsEditing(true)}>Edit Timer</Button>
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
      {isEditing && <TimerModal {...props} close={() => setIsEditing(false)} />}
    </>
  );
}

function TimerModal({ close, state, setState, isMobile }: ModalProps) {
  const [accumulatedDuration, setAccumulatedDuration] = useState<null | number>(
    state.curStartTime == null
      ? state.accumulatedDuration
      : state.accumulatedDuration + Date.now() - state.curStartTime
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
        <DurationInput label="Current value (hh:mm:ss)" onChange={setAccumulatedDuration} initialDurationMs={accumulatedDuration ?? 0} />
        <Group justify="end">
          <Button onClick={close}>Cancel</Button>
          <Button
            color="green"
            disabled={accumulatedDuration == null}
            onClick={() => {
              if (accumulatedDuration == null) {
                return;
              }
              setState({ accumulatedDuration, curStartTime: null });
              close();
            }}>
            Pause
          </Button>
          <Button
            color="green"
            disabled={accumulatedDuration == null}
            onClick={() => {
              if (accumulatedDuration == null) {
                return;
              }
              setState({ accumulatedDuration, curStartTime: Date.now() });
              close();
            }}>
            Resume
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
