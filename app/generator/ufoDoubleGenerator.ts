import getAllSubcategories from "../createboard/getAllSubcategories";
import getFilteredDifficulties from "../createboard/getFilteredDifficulties";
import getNonGeneralCategories from "../createboard/getNonGeneralCategories";
import shuffle from "../createboard/shuffle";
import findGoal from "../findGoal";
import ufoGenerator, { UFOPasta } from "./ufoGenerator";

const MAX_TRIES = 100;

export default function ufoDoubleGenerator(pasta: UFOPasta): [ReadonlyArray<string>, ReadonlyArray<string>] {
  const nonGeneralCategories = getNonGeneralCategories(pasta);
  const allGames = [
    ...getAllSubcategories(pasta.goals, nonGeneralCategories),
  ];
  let bestBoards: null | [ReadonlyArray<string>, ReadonlyArray<string>] = null;
  let bestDupes = Infinity;
  let tryNum = 0;
  while (bestDupes > 0 && tryNum < MAX_TRIES) {
    tryNum += 1;
    shuffle(allGames);
    const partitionIndex = Math.floor(allGames.length / 2);
    const board1 = ufoGenerator({
      ...pasta,
      goals: getFilteredDifficulties(
        pasta.goals,
        new Set(allGames.slice(0, partitionIndex)),
      ),
    });
    const board2 = ufoGenerator({
      ...pasta,
      goals: getFilteredDifficulties(
        pasta.goals,
        new Set(allGames.slice(partitionIndex)),
      ),
    });
    const dupeCount = getAllGames(board1, pasta).intersection(getAllGames(board2, pasta)).size;
    if (dupeCount < bestDupes) {
      bestDupes = dupeCount;
      bestBoards = [board1, board2];
    }
  }
  return bestBoards!;
}

function getAllGames(board: ReadonlyArray<string>, pasta: UFOPasta): Set<string> {
  const allGamesOnBoard = new Set<string>();
  for (const goal of board) {
    const found = findGoal(goal, pasta)!;
    allGamesOnBoard.union(new Set(found.inferredGames));
  }
  return allGamesOnBoard;
}