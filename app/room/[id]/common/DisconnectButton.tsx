import { FeedDisconnect, NewFeedItem } from "@/app/fetchFeed";
import { Button, Modal, Stack, Group } from "@mantine/core";
import { IconPlugConnectedX } from "@tabler/icons-react";
import { useState } from "react";
import { useServerOffsetContext } from "../ServerOffsetContext";

type Props = {
  userId: number;
  isMobile: boolean;
  sendEvent: (newEvent: NewFeedItem) => Promise<boolean>;
};

export default function DisconnectButton({
  isMobile,
  userId,
  sendEvent,
}: Props) {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const { getServerMsFromClientMs } = useServerOffsetContext();
  return (
    <>
      <Button
        color="red"
        onClick={() => setIsDisconnecting(true)}
        leftSection={<IconPlugConnectedX />}
      >
        Disconnect
      </Button>
      {isDisconnecting && (
        <Modal
          fullScreen={isMobile}
          centered={true}
          onClose={() => setIsDisconnecting(false)}
          opened={true}
          title="Disconnect"
        >
          <Stack>
            <span>Are you sure you want to disconnect?</span>
            <Group justify="end">
              <Button onClick={() => setIsDisconnecting(false)}>Cancel</Button>
              <Button
                color="red"
                onClick={async () => {
                  const event: FeedDisconnect = {
                    type: "disconnect",
                    userId,
                    time: getServerMsFromClientMs(Date.now()) / 1000,
                  };
                  await sendEvent(event);
                  window.location.reload();
                }}
              >
                Disconnect
              </Button>
            </Group>
          </Stack>
        </Modal>
      )}
    </>
  );
}
