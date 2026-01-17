import { AllPlayerGames, CurrentGame } from "./useSyncedState";

export default function getGamesForPlayer(
  allPlayerGames: AllPlayerGames,
  playerNum: number
): ReadonlyArray<CurrentGame> {
  return allPlayerGames[playerNum] ?? [];
}