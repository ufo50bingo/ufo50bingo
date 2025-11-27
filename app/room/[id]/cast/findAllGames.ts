import { Game, GAME_NAMES, GoalName, ORDERED_PROPER_GAMES, ProperGame } from "@/app/goals";
import { TBoard } from "@/app/matches/parseBingosyncData";
import { GOAL_TO_TYPES } from "./goalToTypes";

function stripText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "")
}

const NAME_TO_GAME: { [gameName: string]: ProperGame } = {};
Object.entries(GAME_NAMES).forEach(([game, name]) => {
  NAME_TO_GAME[stripText(name)] = game as ProperGame;
});

export type GameToGoals = { [game: string]: ReadonlyArray<[GoalName, number]> };

export function findGamesForGoal(goal: GoalName): Game[] {
  const types = GOAL_TO_TYPES[goal];
  // this is an old goal, or from a non-standard variant
  if (types == null) {
    const split = goal.split(":");
    if (split.length < 2) {
      return [];
    }
    const prefix = stripText(split[0]);
    const game: null | undefined | ProperGame = NAME_TO_GAME[prefix];
    return game != null
      ? [game]
      : [];
  }
  const game = types[0];
  if (game == null) {
    return [];
  }
  if (game !== "general") {
    return [game];
  }
  const games: Game[] = [];
  if (goal.includes("Campanella 1/2/3")) {
    games.push("campanella2");
    games.push("campanella3");
  }
  const strippedGoal = stripText(goal);
  ORDERED_PROPER_GAMES.forEach((name) => {
    const testName = name === "miniandmax" ? "minimax" : name;
    if (strippedGoal.includes(testName)) {
      games.push(name);
    }
  });
  return games;
}

export function getGameToGoals(board: TBoard): GameToGoals {
  const gameToGoals: { [game: string]: [GoalName, number][] } = {};
  board.forEach((square, index) => {
    const goal = square.name as GoalName;
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
