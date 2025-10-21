import { Button, Modal, Stack, Group, List } from "@mantine/core";
import { useState } from "react";
import { REQUEST_PAUSE_CHAT } from "../common/REQUEST_PAUSE_CHAT";
import sendChat from "../common/sendChat";
import { IconPlayerPause } from "@tabler/icons-react";

type Props = {
  id: string;
};

export default function RequestPauseButton({ id }: Props) {
  const [isRequesting, setIsRequesting] = useState(false);
  return (
    <>
      <Button onClick={() => setIsRequesting(true)} leftSection={<IconPlayerPause />}>Request Pause</Button>
      {isRequesting && (
        <Modal
          fullScreen={false}
          centered={true}
          onClose={() => setIsRequesting(false)}
          opened={true}
          title="Request Pause"
        >
          <Stack>
            <span>
              <strong>Are you sure you want to request a pause?</strong><br />
              <br />
              For players and spectators on <strong>ufo50.bingo</strong>:
              <List>
                <List.Item>The board will be hidden</List.Item>
                <List.Item>A notification alarm will play</List.Item>
                <List.Item>The timer will be paused</List.Item>
              </List>
              <br />
              Players and spectators on <strong>Bingosync</strong> will only see a chat message.
            </span>
            <Group justify="end">
              <Button onClick={() => setIsRequesting(false)}>Cancel</Button>
              <Button
                color="green"
                onClick={async () => {
                  await sendChat(id, REQUEST_PAUSE_CHAT);
                  setIsRequesting(false);
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
