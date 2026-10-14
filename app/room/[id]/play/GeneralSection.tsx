import { Accordion, Checkbox, Select, Stack, Tooltip } from "@mantine/core";
import { SortType } from "../cast/useLocalState";
import { useMemo } from "react";
import { Difficulty } from "@/app/goals";

type GeneralType = "simple" | "full";

export type Restrictions = {
  // null means everything
  canTagDifficultyFor: null | ReadonlyArray<Difficulty>;
  canUseFull: boolean;
  canFilterOnCard: boolean;
  canShowOnCardTooltips: boolean;
  canFastSort: boolean;
  canSegment: boolean;
  canUseTerminalCodes: boolean;
  canShowMultiGoalGames: boolean;
};

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
  restrictions: Restrictions;
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
      disabled={!restrictions.canUseFull}
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
    const data = restrictions.canFastSort
      ? [{ value: "fast", label: "Fastest" }]
      : [];
    data.push({ value: "alphabetical", label: "Alphabetical" });
    data.push({ value: "chronological", label: "Chronological" });
    return data;
  }, [restrictions.canFastSort]);
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
                {restrictions.canUseFull ? (
                  typeSelector
                ) : (
                  <Tooltip label="Unavailable for this variant">
                    {typeSelector}
                  </Tooltip>
                )}
                {generalSettings.type === "full" &&
                  (restrictions.canSegment ? (
                    segmentCheckbox
                  ) : (
                    <Tooltip label="Unavailable for this variant">
                      {segmentCheckbox}
                    </Tooltip>
                  ))}
                {generalSettings.type === "full" && sortSelector}
              </>
            )}
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </>
  );
}
