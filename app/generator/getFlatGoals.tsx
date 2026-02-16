import getGoalAndFallback from "./getGoalAndFallback";
import { UFOPasta } from "./ufoGenerator";

export interface UFOGoal {
  name: string;
  subcategory: string;
  category: string;
  sortTokens: null | undefined | string | ReadonlyArray<string>;
}

const CACHE: Array<[UFOPasta, ReadonlyArray<UFOGoal>]> = [];

export default function getFlatGoals(pasta: UFOPasta): ReadonlyArray<UFOGoal> {
  const cached = CACHE.find((item) => item[0] === pasta)?.[1];
  if (cached != null) {
    return cached;
  }

  const flatGoals: Array<UFOGoal> = [];
  Object.keys(pasta.goals).forEach((category) => {
    const subcatToGoals = pasta.goals[category];
    Object.entries(subcatToGoals).forEach(([subcategory, goals]) => {
      goals.forEach((goal) => {
        const sortTokens = typeof goal === "string" ? undefined : goal.sort_tokens;
        flatGoals.push({
          name: getGoalAndFallback(goal)[0],
          subcategory,
          category,
          sortTokens,
        });
      });
    });
  });

  flatGoals.sort();

  CACHE.push([pasta, flatGoals]);
  return flatGoals;
}
