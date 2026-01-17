import { CurrentGame } from "./useSyncedState";

export default function getGamesForPlayer(
  allPlayerGames: ReadonlyArray<ReadonlyArray<CurrentGame>>,
  playerNum: number
): ReadonlyArray<CurrentGame> {
  return allPlayerGames[playerNum] ?? [];
}