import { Accordion, Button, Checkbox, Group, Modal, Stack, Text } from "@mantine/core";
import { TimerState } from "./useMatchTimer";
import { useState } from "react";
import DurationInput from "./DurationInput";

interface Props {
  state: TimerState;
  setState: (newState: TimerState) => unknown;
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

function TimerModal({ close, state, setState }: ModalProps) {
  const [scanMs, setScanMs] = useState(state.scanMs);
  const [matchMs, setMatchMs] = useState(state.matchMs);
  const [remainingMs, setRemainingMs] = useState(() =>
    state.type === 'paused' ? state.remainingMs : Math.max(state.endTime - Date.now(), 0)
  );
  return (
    <Modal
      fullScreen={false}
      centered={true}
      onClose={close}
      opened={true}
      title="Edit Timer"
    >
      <Stack>
        <DurationInput label="Scanning time (between reveal and match start)" onChange={setScanMs} initialDurationMs={scanMs} showHrs={false} />
        <DurationInput label="Match time" onChange={setMatchMs} initialDurationMs={matchMs} showHrs={true} />
        <DurationInput label="Total remaining time (remaining scan time + match time)" onChange={setRemainingMs} initialDurationMs={remainingMs} showHrs={true} />
        <Group justify="end">
          <Button onClick={close}>Cancel</Button>
          <Button color="green" onClick={() => {
            setState({ type: "paused", matchMs, scanMs, remainingMs });
            close();
          }}>
            Pause
          </Button>
          <Button color="green" onClick={() => {
            setState({ type: "running", matchMs, scanMs, endTime: Date.now() + remainingMs });
            close();
          }}>
            Resume
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
