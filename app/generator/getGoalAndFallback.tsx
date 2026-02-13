import { Restriction } from "./ufoGenerator";

export default function getGoalAndFallback(
  goal: string | Restriction,
): string[] {
  return typeof goal === "string"
    ? [goal]
    : [goal.name, goal.restriction.fallback];
}
