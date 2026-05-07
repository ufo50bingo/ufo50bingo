import { UFODifficulties, UFOGoalConfig } from "./ufoGenerator";

export default function findAllGoalsWithShort(
  goals: UFODifficulties,
): Array<UFOGoalConfig> {
  const goalsWithShort: Array<UFOGoalConfig> = [];
  Object.keys(goals).forEach((category) => {
    const categoryGoals = goals[category];
    Object.keys(categoryGoals).forEach((group) => {
      const groupGoals = categoryGoals[group];
      groupGoals.forEach((goal) => {
        if (typeof goal === "object" && goal.short != null) {
          goalsWithShort.push(goal);
        }
      });
    });
  });
  return goalsWithShort;
}
