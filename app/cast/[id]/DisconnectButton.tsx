import { Button, Modal, Stack, Group } from "@mantine/core";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function DisconnectButton() {
  const pathname = usePathname();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  return (
    <>
      <Button color="red" onClick={() => setIsDisconnecting(true)}>
        Disconnect
      </Button>
      {isDisconnecting && (
        <Modal
          fullScreen={false}
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
                onClick={() => {
                  document.cookie = `sessionid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${pathname};`;
                  document.cookie = `playername=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${pathname};`;
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
