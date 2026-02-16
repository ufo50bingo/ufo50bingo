import getGoalAndFallback from "./getGoalAndFallback";
import { UFODifficulties, UFOGoalConfig } from "./ufoGenerator";

const REGEX = /\{\{([^{}]*)\}\}/g;

export default function findAllGoalsWithSortedTokens(goals: UFODifficulties): Array<UFOGoalConfig> {
  const goalsWithSort: Array<UFOGoalConfig> = []
  Object.keys(goals).forEach((category) => {
    const categoryGoals = goals[category];
    Object.keys(categoryGoals).forEach((group) => {
      const groupGoals = categoryGoals[group];
      groupGoals.forEach((goal) => {
        if (typeof goal === "object" && goal.sort_tokens != null) {
          goalsWithSort.push(goal);
        }
      });
    });
  });
  return goalsWithSort;
}
