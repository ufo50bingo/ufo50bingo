import { Button, Input, SegmentedControl } from "@mantine/core";
import { RoomBackend } from "../roomApi";

type Props = {
    isExtraShown: boolean;
    setIsExtraShown: (newIsExtraShown: boolean) => unknown;
    roomBackend: RoomBackend;
    setRoomBackend: (newRoomBackend: RoomBackend) => unknown;
};

export default function ExtraOptions({ isExtraShown, setIsExtraShown, roomBackend, setRoomBackend }: Props) {
    return isExtraShown
        ? (
            <Input.Wrapper
                label="Select backend"
                labelProps={{ style: { display: "block" } }}
                size="xs">
                <SegmentedControl
                    size="xs"
                    data={[
                        {
                            value: "bingosync",
                            label: "Bingosync",
                        },
                        { value: "celeste", label: "Celeste" },
                    ]}
                    value={roomBackend}
                    onChange={setRoomBackend as (newBackend: string) => unknown}
                />
            </Input.Wrapper>
        ) : (
            <Button
                variant="transparent"
                size="compact-xs"
                p={0}
                onClick={() => setIsExtraShown(true)}
                style={{ alignSelf: "flex-start" }}>
                Show uncommon options
            </Button>
        );
}