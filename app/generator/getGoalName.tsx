import { Restriction } from "./ufoGenerator";

export default function getGoalName(goal: string | Restriction): string {
  return typeof goal === "string" ? goal : goal.name;
}
