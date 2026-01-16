import findGoal, { FoundGoal } from "./findGoal";
import { UFOPasta } from "./generator/ufoGenerator";

type FoundGoalAndPasta = {
  foundGoal: FoundGoal<string, string, string>;
  pasta: UFOPasta;
};

export default function findGoalFromAny(
  goal: string,
  pastas: ReadonlyArray<UFOPasta>
): null | FoundGoalAndPasta {
  for (const pasta of pastas) {
    const foundGoal = findGoal(goal, pasta);
    if (foundGoal != null) {
      return { foundGoal, pasta };
    }
  }
  return null;
}
