import { Button, Group, Modal, Stack } from "@mantine/core";
import { TimerState } from "./useMatchTimer";
import { useState } from "react";

interface Props {
  state: TimerState;
  setState: (newState: TimerState) => unknown;
}

interface ModalProps extends Props {
  close: () => unknown;
}

export default function TimerEdit(props: Props) {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <>
      <Button onClick={() => setIsEditing(true)}>Edit Timer</Button>
      {isEditing && <TimerModal {...props} close={() => setIsEditing(false)} />}
    </>
  );
}

function TimerModal({ close, state, setState }: ModalProps) {
  return (
    <Modal
      fullScreen={false}
      centered={true}
      onClose={close}
      opened={true}
      title="Edit Timer"
    >
      <Stack>
        <span>Are you sure you want to request a pause?</span>
        <Group justify="end">
          <Button onClick={close}>Cancel</Button>
          <Button color="green" onClick={() => {}}>
            Request Pause
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
