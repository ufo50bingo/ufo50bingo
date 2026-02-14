import {
  Game,
  GAME_NAMES,
  ORDERED_PROPER_GAMES,
  ProperGame,
} from "@/app/goals";
import { TBoard } from "@/app/matches/parseBingosyncData";
import { STANDARD_UFO } from "@/app/pastas/standardUfo";
import findGoal from "@/app/findGoal";
import { SPICY_UFO } from "@/app/pastas/spicyUfo";

function stripText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const NAME_TO_GAME: { [gameName: string]: ProperGame } = {};
Object.entries(GAME_NAMES).forEach(([game, name]) => {
  NAME_TO_GAME[stripText(name)] = game as ProperGame;
});

export type GameToGoals = { [game: string]: ReadonlyArray<[string, number]> };

export function findGamesForGoal(goal: string): Game[] {
  const result = findGoal(goal, STANDARD_UFO) ?? findGoal(goal, SPICY_UFO);
  return findGamesForResult(goal, result);
}

interface WithSubcategory {
  subcategory: string;
}
export function findGamesForResult(
  goal: string,
  result: WithSubcategory | null,
): Game[] {
  // this is an old goal, or from a non-standard variant
  if (result == null) {
    const split = goal.split(":");
    if (split.length < 2) {
      return [];
    }
    const prefix = stripText(split[0]);
    const game: null | undefined | ProperGame = NAME_TO_GAME[prefix];
    return game != null ? [game] : [];
  }
  const game = result.subcategory;
  if (game == null) {
    return [];
  }
  if (ORDERED_PROPER_GAMES.includes(game as ProperGame)) {
    return [game as ProperGame];
  }
  const games: Game[] = [];
  if (
    goal.includes("Campanella 1/2/3") ||
    goal.includes("Campanella 1, 2, and 3")
  ) {
    games.push("campanella2");
    games.push("campanella3");
  }
  const strippedGoal = stripText(goal);
  ORDERED_PROPER_GAMES.forEach((name) => {
    const testName = name === "miniandmax" ? "minimax" : name;
    const testGoal =
      name === "mortol"
        ? strippedGoal.replace("mortolii", "")
        : name === "campanella"
          ? strippedGoal.replace("campanella2", "").replace("campanella3", "")
          : strippedGoal;
    if (testGoal.includes(testName)) {
      games.push(name);
    }
  });
  return games;
}

export function getGameToGoals(board: TBoard): GameToGoals {
  const gameToGoals: { [game: string]: [string, number][] } = {};
  board.forEach((square, index) => {
    const goal = square.name;
    const gamesForGoal = findGamesForGoal(goal);
    gamesForGoal.forEach((game) => {
      const existingGoals = gameToGoals[game] ?? [];
      existingGoals.push([goal, index]);
      gameToGoals[game] = existingGoals;
    });
  });
  return gameToGoals;
}

const TERMINAL_CODE = /[A-Z0-9]{4}-[A-Z0-9]{4}/;
export function getTerminalCode(goal: string): null | string {
  const result = goal.match(TERMINAL_CODE);
  if (result == null) {
    return null;
  }
  return result[0];
}

export function getAllTerminalCodes(board: TBoard): Set<string> {
  const codes = new Set<string>();
  board.forEach((square) => {
    const code = getTerminalCode(square.name);
    if (code != null) {
      codes.add(code);
    }
  });
  return codes;
}
