import { UFODifficulties, UFOGameGoals } from "../generator/ufoGenerator";

export default function getFilteredDifficulties(difficultyToGameToGoals: UFODifficulties, excludedGames: Set<string>): UFODifficulties {
  // we check for excluded games instead of included
  // so we don't accidentally remove generals
  const filtered: UFODifficulties = {};
  Object.keys(difficultyToGameToGoals).forEach((difficulty) => {
    const gameToGoals = difficultyToGameToGoals[difficulty];
    const newGameToGoals: UFOGameGoals = {};
    Object.keys(gameToGoals).forEach((game) => {
      if (!excludedGames.has(game)) {
        newGameToGoals[game] = gameToGoals[game];
      }
    });
    filtered[difficulty] = newGameToGoals;
  });
  return filtered;
}