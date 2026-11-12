import { NewFeed, ParsedSubcategory } from "@/app/fetchFeed";
import { AllPlayerGames, CurrentGame } from "./useSyncedState";
import { useMemo } from "react";

export default function useAllPlayerGames(
  feed: NewFeed,
  subcategories: ReadonlyArray<ParsedSubcategory>,
): AllPlayerGames {
  return useMemo(() => {
    const allGames: Map<number, Array<CurrentGame>> = new Map();
    for (const item of feed) {
      if (item.type === "current_subcategory") {
        const userGames = allGames.get(item.userId) ?? [];
        if (item.subcategoryId == null) {
          userGames.push({ game: null, start_time: item.time });
        } else {
          const subcategory = subcategories.find(
            (sc) => sc.subcategoryId === item.subcategoryId,
          );
          userGames.push({
            game: subcategory?.name ?? null,
            start_time: item.time,
          });
        }
        allGames.set(item.userId, userGames);
      }
    }
    return allGames;
  }, [feed, subcategories]);
}
