import sendChat from "@/app/cast/[id]/sendChat";
import { Button, Modal, Stack, Group } from "@mantine/core";
import { useState } from "react";
import { REQUEST_PAUSE_CHAT } from "./REQUEST_PAUSE_CHAT";

type Props = {
  id: string;
};

export default function RequestPauseButton({ id }: Props) {
  const [isRequesting, setIsRequesting] = useState(false);
  return (
    <>
      <Button onClick={() => setIsRequesting(true)}>Request Pause</Button>
      {isRequesting && (
        <Modal
          fullScreen={false}
          centered={true}
          onClose={() => setIsRequesting(false)}
          opened={true}
          title="Request Pause"
        >
          <Stack>
            <span>Are you sure you want to request a pause?</span>
            <Group justify="end">
              <Button onClick={() => setIsRequesting(false)}>Cancel</Button>
              <Button
                color="green"
                onClick={async () => {
                  await sendChat(id, REQUEST_PAUSE_CHAT);
                }}
              >
                Request Pause
              </Button>
            </Group>
          </Stack>
        </Modal>
      )}
    </>
  );
}
