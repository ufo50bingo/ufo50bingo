import { Stack, Button } from "@mantine/core";
import DisconnectButton from "./DisconnectButton";
import { getRoomUrl } from "@/app/roomApi";

type Props = {
  id: string;
  isMobile: boolean;
};

export default function BottomSection({ id, isMobile }: Props) {
  return (
    <Stack p="md">
      <Button component="a" href={getRoomUrl(id, "bingosync")}>
        View Bingosync room
      </Button>
      <DisconnectButton isMobile={isMobile} />
    </Stack>
  );
}
