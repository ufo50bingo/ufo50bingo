import { Accordion, Alert, Button, Checkbox, Select, Stack, Tooltip } from "@mantine/core";
import { SortType } from "../cast/useLocalState";
import { useMemo } from "react";

type GeneralType = "simple" | "full";

export type GeneralRestrictions = {
    canUseFull: boolean;
    canFilterOnCard: boolean;
    canShowOnCardTooltips: boolean;
    canFastSort: boolean;
    canSegment: boolean;
    canUseTerminalCodes: boolean;
};

export type GeneralSettings = {
    type: "simple" | "full";
    sort: SortType;
    shouldSegment: boolean;
};

export type GeneralSetters = {
    setType: (newGeneralType: GeneralType) => unknown,
    setSort: (newGeneralSort: SortType) => unknown,
    setShouldSegment: (newShouldSegment: boolean) => unknown,
}

type Props = {
    generalSettings: GeneralSettings;
    generalRestrictions: GeneralRestrictions;
    generalSetters: GeneralSetters;
}

export default function GeneralSection({
    generalSettings,
    generalRestrictions,
    generalSetters,
}: Props) {
    const typeSelector = (
        <Select
            label="Tracker type"
            data={[
                { value: "full", label: "Full" },
                { value: "simple", label: "Simple" },
            ]}
            value={generalSettings.type}
            onChange={generalSetters.setType as (newGeneralType: string | null) => unknown}
            disabled={!generalRestrictions.canUseFull}
        />
    );
    const segmentCheckbox = (
        <Checkbox
            label="Hide very slow options by default"
            checked={generalSettings.shouldSegment}
            onChange={(event) =>
                generalSetters.setShouldSegment(event.target.checked)
            }
        />
    );
    const sortData = useMemo(() => {
        const data = generalRestrictions.canFastSort ? [{ value: "fast", label: "Fastest" }] : [];
        data.push({ value: "alphabetical", label: "Alphabetical" });
        data.push({ value: "chronological", label: "Chronological" });
        return data;
    }, [generalRestrictions.canFastSort]);
    const sortSelector = (
        <Select
            label="Sort type"
            data={sortData}
            value={generalSettings.sort}
            onChange={generalSetters.setSort as (newSortType: string | null) => unknown}
        />
    );
    return (
        <>
            <Accordion.Item value="general">
                <Accordion.Control>General Tracker</Accordion.Control>
                <Accordion.Panel>
                    <Stack>
                        {generalRestrictions.canUseFull ? typeSelector : (
                            <Tooltip label="Unavailable for this variant">{typeSelector}</Tooltip>
                        )}
                        {generalSettings.type === "full" && (generalRestrictions.canSegment ? segmentCheckbox : (
                            <Tooltip label="Unavailable for this variant">{segmentCheckbox}</Tooltip>
                        ))}
                        {generalSettings.type === "full" && sortSelector}
                    </Stack>
                </Accordion.Panel>
            </Accordion.Item>
        </>
    );
}