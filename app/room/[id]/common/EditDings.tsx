import { Card, Stack, Checkbox, Text } from "@mantine/core";
import { Ding } from "../play/useDings";

type Props = {
    dings: ReadonlyArray<Ding>;
    setDings: (newDings: ReadonlyArray<Ding>) => unknown;
};

const ALL_DINGS: ReadonlyArray<{ value: Ding; name: string }> = [
    { value: "pause", name: "Pause is requested" },
    { value: "chat", name: "Chat message is received" },
    { value: "square", name: "Square is marked" },
];

export default function EditDings({ dings, setDings }: Props) {
    return (
        <Card shadow="sm" padding="sm" radius="md" withBorder={true}>
            <Stack>
                <Text size="sm">Play notification sound when:</Text>
                {ALL_DINGS.map((ding) => (
                    <Checkbox
                        key={ding.value}
                        checked={dings.includes(ding.value)}
                        onChange={(event) =>
                            setDings(
                                event.currentTarget.checked
                                    ? [...dings, ding.value]
                                    : dings.filter((d) => d !== ding.value)
                            )
                        }
                        label={ding.name}
                    />
                ))}
            </Stack>
        </Card>
    );
}