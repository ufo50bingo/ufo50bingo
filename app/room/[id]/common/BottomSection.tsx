import { Stack, Button } from "@mantine/core";
import DisconnectButton from "./DisconnectButton";
import { getRoomUrl, RoomBackend } from "@/app/roomApi";

type Props = {
  id: string;
  isMobile: boolean;
  roomBackend: RoomBackend;
};

export default function BottomSection({ id, isMobile, roomBackend }: Props) {
  return (
    <Stack p="md">
      <Button component="a" href={getRoomUrl(id, roomBackend)}>
        View Bingosync room
      </Button>
      <DisconnectButton isMobile={isMobile} />
    </Stack>
  );
}
