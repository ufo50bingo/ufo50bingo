import useLocalEnum from "@/app/localStorage/useLocalEnum";
import { GeneralSetters, GeneralSettings } from "./GeneralSection";
import useLocalBool from "@/app/localStorage/useLocalBool";
import { PlayerTrackerRestrictions } from "@/app/generator/ufoGenerator";

export default function useGeneralSettings(
  restrictions: PlayerTrackerRestrictions,
): [GeneralSettings, GeneralSetters] {
  const [type, setType] = useLocalEnum({
    key: "general_type",
    defaultValue: "full",
    options: ["full", "simple"],
  });
  const [rawSort, setSort] = useLocalEnum({
    key: "player_general_sort",
    defaultValue: "fast",
    options: ["fast", "alphabetical", "chronological"],
  });
  const [shouldSegment, setShouldSegment] = useLocalBool({
    key: "should_segment",
    defaultValue: true,
  });

  const sort =
    !restrictions.allow_fast_sort && rawSort === "fast"
      ? "chronological"
      : rawSort;

  return [
    { type, sort, shouldSegment },
    { setType, setSort, setShouldSegment },
  ];
}
