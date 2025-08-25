import { Difficulty, Game, TGoal } from './goals';
import shuffle from './shuffle';

export type MutablePasta = TGoal[][];
export type Pasta = ReadonlyArray<ReadonlyArray<TGoal>>;

export default function createPasta(
  filteredPasta: Pasta,
  difficultyCount: Map<Difficulty, number>
): Pasta {
  const goalsByDifficultyAndGame = new Map<Difficulty, Map<Game, TGoal[]>>();
  filteredPasta.forEach((group) =>
    group.forEach((goal) => {
      if (goal.types[1] === 'general') {
        return;
      }
      const gameToGoals = goalsByDifficultyAndGame.get(goal.types[1]) ?? new Map<Game, TGoal[]>();
      const goalsArray = gameToGoals.get(goal.types[0]) ?? [];
      goalsArray.push(goal);
      gameToGoals.set(goal.types[0], goalsArray);
      goalsByDifficultyAndGame.set(goal.types[1], gameToGoals);
    })
  );

  const finalPasta: MutablePasta = [];
  // add in all groups for each non-general difficulty
  goalsByDifficultyAndGame.forEach((gameToGoals, difficulty) => {
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
        finalPasta.push(newGroup);
      }
    } else {
      // if there aren't enough games to fill out the groups, just make a flat list of games
      const allGoals = allGames.flat();
      const minGroupSize = Math.floor(allGoals.length / groupCount);
      const remainder = allGoals.length % groupCount;

      for (let i = 0; i < groupCount; i++) {
        const goalsToAdd = i < remainder ? minGroupSize + 1 : minGroupSize;
        const newGroup = allGoals.splice(0, goalsToAdd);
        finalPasta.push(newGroup);
      }
    }
  });

  // general goals are special, because they're already sorted into meaningful categories
  const generalGroups = filteredPasta
    .filter((group) => group.length > 0 && group[0].types[0] === 'general')
    // copy group so we don't accidentally mess up the original pasta
    .map((group) => [...group]);
  shuffle(generalGroups);
  const numGeneralGroups = difficultyCount.get('general') ?? 0;
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
