import findGoal, { FoundGoal } from "./findGoal";
import { ALL_PRACTICE_PASTAS } from "./usePracticePasta";

export default function findGoalFromEvery(
  goal: string
): ReadonlyArray<FoundGoal<string, string, string>> {
  const results: FoundGoal<string, string, string>[] = [];
  for (const pasta of ALL_PRACTICE_PASTAS) {
    const foundGoal = findGoal(goal, pasta);
    if (foundGoal != null) {
      results.push(foundGoal);
    }
  }
  return results;
}
