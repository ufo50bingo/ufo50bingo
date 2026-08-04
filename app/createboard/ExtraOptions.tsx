import { Anchor, Input, SegmentedControl } from "@mantine/core";
import { RoomBackend } from "../roomApi";

type Props = {
    isExtraShown: boolean;
    setIsExtraShown: (newIsExtraShown: boolean) => unknown;
    roomBackend: RoomBackend;
    setRoomBackend: (newRoomBackend: RoomBackend) => unknown;
};

export default function ExtraOptions({ isExtraShown, setIsExtraShown, roomBackend, setRoomBackend }: Props) {
    return isExtraShown
        ? <Anchor size="xs" href="#" onClick={() => setIsExtraShown(true)}>Show uncommon options</Anchor>
        : (
            <Input.Wrapper
                label="Select backend"
                description="Choose how items are displayed"
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
        )
}