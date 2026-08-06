import useLocalEnum from "@/app/localStorage/useLocalEnum";
import { GeneralRestrictions, GeneralSetters, GeneralSettings } from "./GeneralSection";
import useLocalBool from "@/app/localStorage/useLocalBool";

export default function useGeneralSettings(restrictions: GeneralRestrictions): [GeneralSettings, GeneralSetters] {
  const [rawType, setType] = useLocalEnum({
    key: "general_type",
    defaultValue: "full",
    options: ["full", "simple"],
  });
  const [rawSort, setSort] = useLocalEnum({
    key: "player_general_sort",
    defaultValue: "fast",
    options: ["fast", "alphabetical", "chronological"],
  });
  const [rawShouldSegment, setShouldSegment] = useLocalBool({
    key: "should_segment",
    defaultValue: true,
  });

  const type = !restrictions.canUseFull && rawType === "full" ? "simple" : rawType;
  const sort = !restrictions.canFastSort && rawSort === "fast" ? "chronological" : rawSort;
  const shouldSegment = rawShouldSegment && restrictions.canSegment;

  return [
    { type, sort, shouldSegment },
    { setType, setSort, setShouldSegment },
  ];
}