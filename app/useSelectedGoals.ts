import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";
import getFlatGoals from "./generator/getFlatGoals";
import { UFOPasta } from "./generator/ufoGenerator";

export default function useSelectedGoals(pasta: UFOPasta): Set<string> {
  const unselectedGoals = useLiveQuery(() => db.unselectedGoals.toArray());
  return useMemo(() => {
    const unselectedGoalsSet = new Set(
      unselectedGoals?.map((row) => row.goal) ?? []
    );

    const selectedGoals = new Set<string>();
    getFlatGoals(pasta).forEach((goal) => {
      if (!unselectedGoalsSet.has(goal.name)) {
        selectedGoals.add(goal.name);
      }
    });
    return selectedGoals;
  }, [unselectedGoals, pasta]);
}
