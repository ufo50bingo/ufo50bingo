import { Stack, Button } from "@mantine/core";
import DisconnectButton from "./DisconnectButton";

type Props = {
    id: string;
};

export default function BottomSection({ id }: Props) {
    return (
        <Stack p="md">
            <Button
                component="a"
                href={`https://www.bingosync.com/room/${id}`}
            >
                View Bingosync room
            </Button>
            <DisconnectButton />
        </Stack>
    );
}