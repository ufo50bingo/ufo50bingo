import { Stack, Button } from "@mantine/core";
import DisconnectButton from "./DisconnectButton";

type Props = {
  id: string;
  isMobile: boolean;
};

export default function BottomSection({ id, isMobile }: Props) {
  return (
    <Stack p="md">
      <Button component="a" href={`https://celestebingo.rhelmot.io/room/${id}`}>
        View Bingosync room
      </Button>
      <DisconnectButton isMobile={isMobile} />
    </Stack>
  );
}
