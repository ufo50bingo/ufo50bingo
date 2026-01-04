import { Center, SegmentedControl } from "@mantine/core";
import { IconCalendar, IconSortAZ } from "@tabler/icons-react";

export type CheckerSort = "chronological" | "alphabetical";

type Props = {
    sort: CheckerSort,
    setSort: (newSort: CheckerSort) => unknown,
};

export default function CheckerSortSelector({ sort, setSort }: Props) {
    return (
        <SegmentedControl
            size="sm"
            value={sort}
            onChange={(newValue: string) => setSort(newValue as CheckerSort)}
            data={[
                {
                    value: "chronological",
                    label: (
                        <Center>
                            <IconCalendar size={16} />
                        </Center>
                    ),
                },
                {
                    value: "alphabetical",
                    label: (
                        <Center>
                            <IconSortAZ size={16} />
                        </Center>
                    ),
                }
            ]}
        />
    );
}