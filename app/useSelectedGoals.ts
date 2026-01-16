import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";
import { STANDARD_UFO } from "./pastas/standardUfo";
import getFlatGoals from "./generator/getFlatGoals";
import { SPICY_UFO } from "./pastas/spicyUfo";

export default function useSelectedGoals(): Set<string> {

  const unselectedGoals = useLiveQuery(() => db.unselectedGoals.toArray());
  return useMemo(() => {
    const unselectedGoalsSet = new Set(
      unselectedGoals?.map((row) => row.goal) ?? []
    );

    const selectedGoals = new Set<string>();
    getFlatGoals(STANDARD_UFO).forEach((goal) => {
      if (!unselectedGoalsSet.has(goal.name)) {
        selectedGoals.add(goal.name);
      }
    });
    getFlatGoals(SPICY_UFO).forEach((goal) => {
      if (!unselectedGoalsSet.has(goal.name)) {
        selectedGoals.add(goal.name);
      }
    });
    return selectedGoals;
  }, [unselectedGoals]);
}
