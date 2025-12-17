import getDefaultDifficulties from "../createboard/getDefaultDifficulties";
import { ORDERED_GAMES } from "../goals";
import { GoalWithDifficulty, Pasta } from "../pastas/metadata";
import { UFOPasta } from "./ufoGenerator";

export default function convertToUfo(pasta: Pasta): UFOPasta {
  const difficulties = getDefaultDifficulties(pasta);
  const category_counts: { [difficulty: string]: number } = {};
  difficulties.forEach((count, difficulty) => {
    category_counts[difficulty] = count;
  });
  // some goals in may be repeated, so we need to filter them out
  const seenGoals: Set<string> = new Set();
  const sortedFlatGoals: ReadonlyArray<GoalWithDifficulty> = pasta
    .flat()
    .filter((goal) => {
      const hasSeen = seenGoals.has(goal.name);
      seenGoals.add(goal.name);
      return !hasSeen;
    })
    .toSorted((a, b) => {
      const gameDiff =
        ORDERED_GAMES.indexOf(a.types[0]) - ORDERED_GAMES.indexOf(b.types[0]);
      if (gameDiff !== 0) {
        return gameDiff;
      }
      return a.name.localeCompare(b.name);
    });
  const diffToGameToGoals: {
    [difficulty: string]: { [game: string]: Array<string> };
  } = {};
  sortedFlatGoals.forEach((goal) => {
    const game = goal.types[0];
    const difficulty = goal.types[1];
    if (difficulty === "general") {
      return;
    }
    const gameToGoals = diffToGameToGoals[difficulty] ?? {};
    const goals = gameToGoals[game] ?? [];
    goals.push(goal.name);
    gameToGoals[game] = goals;
    diffToGameToGoals[difficulty] = gameToGoals;
  });
  diffToGameToGoals["general"] = {};
  pasta
    .slice(pasta.length - (category_counts["general"] ?? 0))
    .forEach((group, index) => {
      diffToGameToGoals["general"][`temp-${index}`] = group.map(
        (goal) => goal.name
      );
    });
  return {
    goals: diffToGameToGoals,
    tokens: {},
    category_counts,
  };
}
