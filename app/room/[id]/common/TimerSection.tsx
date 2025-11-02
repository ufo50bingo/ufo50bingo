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
              The timer will start counting down the scanning time as soon as you reveal the board,
              and it will switch to a full match timer as soon as the scanning time has expired. If
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
  const [accumulatedDuration, setAccumulatedDuration] = useState(
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
        <DurationInput label="Current time" onChange={setAccumulatedDuration} initialDurationMs={accumulatedDuration} showHrs={true} />
        <Group justify="end">
          <Button onClick={close}>Cancel</Button>
          <Button color="green" onClick={() => {
            setState({ accumulatedDuration, curStartTime: null });
            close();
          }}>
            Pause
          </Button>
          <Button color="green" onClick={() => {
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
