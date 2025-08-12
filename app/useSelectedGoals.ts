import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { SORTED_FLAT_GOALS } from './goals';

export default function useSelectedGoals(): Set<string> {
  const unselectedGoals = useLiveQuery(() => db.unselectedGoals.toArray());
  return useMemo(() => {
    const unselectedGoalsSet = new Set(unselectedGoals?.map((row) => row.goal) ?? []);

    const selectedGoals = new Set<string>();
    SORTED_FLAT_GOALS.forEach((goal) => {
      if (!unselectedGoalsSet.has(goal.name)) {
        selectedGoals.add(goal.name);
      }
    });
    return selectedGoals;
  }, [unselectedGoals]);
}
