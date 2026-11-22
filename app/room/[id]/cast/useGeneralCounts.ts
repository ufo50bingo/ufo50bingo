import { NewFeed, ParsedSubcategory, SquareWithId } from "@/app/fetchFeed";
import { useMemo } from "react";
import { GeneralCounts } from "./CastPage";

export default function useGeneralCounts(
  feed: NewFeed,
  squares: ReadonlyArray<SquareWithId>,
  subcategories: ReadonlyArray<ParsedSubcategory>,
): GeneralCounts {
  return useMemo(() => {
    const generalCounts: GeneralCounts = {};
    for (const item of feed) {
      if (item.type === "goal_progress") {
        const goalName = squares.find((sq) => sq.goalId === item.goalId)!.name;
        const subcategoryName = subcategories.find(
          (sc) => sc.subcategoryId === item.subcategoryId,
        )!.name;
        const goalCounts = generalCounts[goalName] ?? {};
        const playerCounts = goalCounts[item.userId] ?? {};
        playerCounts[subcategoryName] = item.count;
        goalCounts[item.userId] = playerCounts;
        generalCounts[goalName] = goalCounts;
      }
    }
    return generalCounts;
  }, [feed, squares, subcategories]);
}
