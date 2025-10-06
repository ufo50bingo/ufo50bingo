import { Game, GoalName, ORDERED_PROPER_GAMES } from "@/app/goals";
import { TBoard } from "@/app/matches/parseBingosyncData";
import { GOAL_TO_TYPES } from "./goalToTypes";

export type GameToGoals = { [game: string]: ReadonlyArray<GoalName> };

export function findGamesForGoal(goal: GoalName): Game[] {
  const game = GOAL_TO_TYPES[goal][0];
  if (game == null) {
    return [];
  }
  if (game !== "general") {
    return [game];
  }
  const games: Game[] = [];
  if (goal.includes("Campanella 1/2/3")) {
    games.push("campanella");
    games.push("campanella2");
    games.push("campanella3");
  }
  const strippedGoal = goal.toLowerCase().replace(/[^a-z0-9]/g, "");
  ORDERED_PROPER_GAMES.forEach((name) => {
    const testName = name === "miniandmax" ? "minimax" : name;
    if (strippedGoal.includes(testName)) {
      games.push(name);
    }
  });
  return games;
}

export function getGameToGoals(board: TBoard): GameToGoals {
  const gameToGoals: { [game: string]: GoalName[] } = {};
  board.forEach((square) => {
    const goal = square.name as GoalName;
    const gamesForGoal = findGamesForGoal(goal);
    gamesForGoal.forEach((game) => {
      const existingGoals = gameToGoals[game] ?? [];
      existingGoals.push(goal);
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
