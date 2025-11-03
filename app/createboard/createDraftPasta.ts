import { Difficulty, Game } from "../goals";
import { GoalWithDifficulty, Pasta } from "../pastas/metadata";
import { PlayerToDifficultyToGameToGoal } from "./DraftCreator";
import shuffle from "./shuffle";

export type MutablePasta = GoalWithDifficulty[][];

const ORDERED_PROPER_DIFFICULTIES: ReadonlyArray<Difficulty> = ["easy", "medium", "hard", "veryhard"];

export default function createDraftPasta(
  pasta: Pasta,
  generalCount: number,
  playerToDifficultyToGameToGoal: PlayerToDifficultyToGameToGoal,
  difficultyCountsByPlayer: ReadonlyArray<Map<"easy" | "medium" | "hard" | "veryhard" | "general", number>>
): Pasta {
  const playerToDifficultyToGroups = playerToDifficultyToGameToGoal.map((difficultyToGameToGoal, playerIndex) => {
    const difficultyToGroups: Map<Difficulty, GoalWithDifficulty[][]> = new Map([
      ["easy", []], ["medium", []], ["hard", []], ["veryhard", []]
    ]);
    const difficultyCount = difficultyCountsByPlayer[playerIndex];
    difficultyToGameToGoal.forEach((gameToGoals, difficulty) => {
      const groupCount = difficultyCount.get(difficulty) ?? 0;
      const allGames = Array.from(gameToGoals.values());
      shuffle(allGames);
      if (gameToGoals.size >= groupCount) {
        // if we at least as many games as groups to create, make sure each game is only in one group
        const minGroupSize = Math.floor(allGames.length / groupCount);
        const remainder = allGames.length % groupCount;

        for (let i = 0; i < groupCount; i++) {
          const gamesToAdd = i < remainder ? minGroupSize + 1 : minGroupSize;
          const newGroup = allGames.splice(0, gamesToAdd).flat();
          const existing = difficultyToGroups.get(difficulty) ?? [];
          existing.push(newGroup);
          difficultyToGroups.set(difficulty, existing);
        }
      } else {
        // if there aren't enough games to fill out the groups, just make a flat list of games
        const allGoals = allGames.flat();
        const minGroupSize = Math.floor(allGoals.length / groupCount);
        const remainder = allGoals.length % groupCount;

        for (let i = 0; i < groupCount; i++) {
          const goalsToAdd = i < remainder ? minGroupSize + 1 : minGroupSize;
          const newGroup = allGoals.splice(0, goalsToAdd);
          const existing = difficultyToGroups.get(difficulty) ?? [];
          existing.push(newGroup);
          difficultyToGroups.set(difficulty, existing);;
        }
      }
    });
    return difficultyToGroups;
  });

  const finalPasta: MutablePasta = ORDERED_PROPER_DIFFICULTIES
    .map(difficulty => {
      const playerGroups = playerToDifficultyToGroups.map(difficultyToGroups => difficultyToGroups.get(difficulty) ?? []);
      const allGroups = playerGroups.flat();
      shuffle(allGroups);
      return allGroups;
    })
    .flat();

  // general goals are special, because they're already sorted into meaningful categories
  const generalGroups = pasta
    .filter((group) => group.length > 0 && group[0].types[0] === "general")
    // copy group so we don't accidentally mess up the original pasta
    .map((group) => [...group]);
  shuffle(generalGroups);
  const numGeneralGroups = generalCount;
  // if there aren't enough general groups, split an existing one as evenly as possible
  while (
    numGeneralGroups > generalGroups.length &&
    generalGroups.length > 0 &&
    generalGroups[generalGroups.length - 1].length > 1
  ) {
    const groupToSplit = generalGroups.pop();
    if (groupToSplit != null) {
      const splitLocation = Math.ceil(groupToSplit.length / 2);
      const newGroup = groupToSplit.splice(0, splitLocation);
      generalGroups.unshift(newGroup);
      generalGroups.unshift(groupToSplit);
    }
  }
  // there must be enough now, due to earlier validation that the number of goals is >= number of groups
  finalPasta.push(...generalGroups.slice(0, numGeneralGroups));

  return finalPasta;
}
