import { FeedDisconnect, NewFeedItem } from "@/app/fetchFeed";
import { Button, Modal, Stack, Group, Checkbox } from "@mantine/core";
import { IconPlugConnectedX } from "@tabler/icons-react";
import { useState } from "react";
import { useServerOffsetContext } from "../ServerOffsetContext";

type Props = {
  userId: number;
  isMobile: boolean;
  sendEvents: (newEvent: ReadonlyArray<NewFeedItem>) => Promise<boolean>;
};

export default function DisconnectButton({
  isMobile,
  userId,
  sendEvents,
}: Props) {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const { getServerMsFromClientMs } = useServerOffsetContext();
  return (
    <>
      <Button
        color="red"
        onClick={() => setIsDisconnecting(true)}
        leftSection={<IconPlugConnectedX />}
      >
        Withdraw
      </Button>
      {isDisconnecting && (
        <Modal
          fullScreen={isMobile}
          centered={true}
          onClose={() => setIsDisconnecting(false)}
          opened={true}
          title="Withdraw"
        >
          <Stack>
            <span>
              Are you sure you want to withdraw from the match? You will be
              removed from the member list for the match, and your name won't be
              included in the final results.
              <br />
              <br />
              <strong>
                You should only withdraw if you joined the match by mistake!
              </strong>
            </span>
            <Checkbox
              checked={hasConfirmed}
              onChange={(e) => setHasConfirmed(e.target.checked)}
              label="I joined this match by mistake"
            />
            <Group justify="end">
              <Button onClick={() => setIsDisconnecting(false)}>Cancel</Button>
              <Button
                color="red"
                disabled={!hasConfirmed}
                onClick={async () => {
                  const event: FeedDisconnect = {
                    type: "disconnect",
                    userId,
                    time: getServerMsFromClientMs(Date.now()) / 1000,
                  };
                  await sendEvents([event]);
                  window.location.reload();
                }}
              >
                Withdraw
              </Button>
            </Group>
          </Stack>
        </Modal>
      )}
    </>
  );
}
