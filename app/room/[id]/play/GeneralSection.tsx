import { Accordion, Checkbox, Select, Stack } from "@mantine/core";
import { SortType } from "../cast/useLocalState";
import { useMemo } from "react";
import { PlayerTrackerRestrictions } from "@/app/generator/ufoGenerator";

type GeneralType = "simple" | "full";

export type GeneralSettings = {
  type: "simple" | "full";
  sort: SortType;
  shouldSegment: boolean;
};

export type GeneralSetters = {
  setType: (newGeneralType: GeneralType) => unknown;
  setSort: (newGeneralSort: SortType) => unknown;
  setShouldSegment: (newShouldSegment: boolean) => unknown;
};

type Props = {
  generalSettings: GeneralSettings;
  restrictions: PlayerTrackerRestrictions;
  generalSetters: GeneralSetters;
  showGeneralTracker: boolean;
  setShowGeneralTracker: (newShowGeneralTracker: boolean) => unknown;
};

export default function GeneralSection({
  generalSettings,
  restrictions,
  generalSetters,
  showGeneralTracker,
  setShowGeneralTracker,
}: Props) {
  const typeSelector = (
    <Select
      label="Tracker type"
      data={[
        { value: "full", label: "Full" },
        { value: "simple", label: "Simple" },
      ]}
      value={generalSettings.type}
      onChange={
        generalSetters.setType as (newGeneralType: string | null) => unknown
      }
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
    const data = restrictions.allow_fast_sort
      ? [{ value: "fast", label: "Fastest" }]
      : [];
    data.push({ value: "alphabetical", label: "Alphabetical" });
    data.push({ value: "chronological", label: "Chronological" });
    return data;
  }, [restrictions.allow_fast_sort]);
  const sortSelector = (
    <Select
      label="Sort type"
      data={sortData}
      value={generalSettings.sort}
      onChange={
        generalSetters.setSort as (newSortType: string | null) => unknown
      }
    />
  );
  return (
    <>
      <Accordion.Item value="general">
        <Accordion.Control>General Tracker</Accordion.Control>
        <Accordion.Panel>
          <Stack>
            <Checkbox
              checked={showGeneralTracker}
              onChange={(event) => setShowGeneralTracker(event.target.checked)}
              label="Show general goal tracker"
            />
            {showGeneralTracker && (
              <>
                {typeSelector}
                {segmentCheckbox}
                {generalSettings.type === "full" && sortSelector}
              </>
            )}
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </>
  );
}
