import { GAME_NAMES, ProperGame } from "@/app/goals";
import { STANDARD_UFO } from "@/app/pastas/standardUfo";
import findGoal from "@/app/findGoal";
import { SPICY_UFO } from "@/app/pastas/spicyUfo";
import { NES_50_UFO } from "@/app/pastas/nes50Ufo";
import { inferGames } from "@/app/generator/inferGames";
import { EVERY_GAME_UFO } from "@/app/pastas/everyGameUfo";

function stripText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const NAME_TO_GAME: { [gameName: string]: ProperGame } = {};
Object.entries(GAME_NAMES).forEach(([game, name]) => {
  NAME_TO_GAME[stripText(name)] = game as ProperGame;
});

export type GameToGoals = { [game: string]: ReadonlyArray<[string, number]> };

export function getGameToGoals(
  board: ReadonlyArray<string>,
  allGames: ReadonlyArray<string>,
): GameToGoals {
  const gameToGoals: { [game: string]: [string, number][] } = {};
  board.forEach((goal, index) => {
    const result =
      findGoal(goal, STANDARD_UFO) ??
      findGoal(goal, SPICY_UFO) ??
      findGoal(goal, NES_50_UFO) ??
      findGoal(goal, EVERY_GAME_UFO);
    const gamesForGoal =
      result != null ? result.inferredGames : inferGames(goal, allGames);
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

export function getAllTerminalCodes(board: ReadonlyArray<string>): Set<string> {
  const codes = new Set<string>();
  board.forEach((name) => {
    const code = getTerminalCode(name);
    if (code != null) {
      codes.add(code);
    }
  });
  return codes;
}
