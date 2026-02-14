import { UFOGoalConfig } from "./ufoGenerator";

export default function getGoalAndFallback(
  goal: string | UFOGoalConfig,
): string[] {
  if (typeof goal === "string") {
    return [goal];
  }
  const goalAndFallback = [goal.name];
  if (goal.restriction != null) {
    goalAndFallback.push(goal.restriction.fallback);
  }
  return goalAndFallback;
}
