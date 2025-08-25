import { Difficulty, Game, GoalName } from './goals';
import shuffle from './shuffle';

export type TGoalWithoutDifficulty = {
  readonly name: GoalName;
  readonly types: readonly [Game];
};

type MutablePasta = TGoalWithoutDifficulty[][];
type PastaWithoutDifficulty = ReadonlyArray<ReadonlyArray<TGoalWithoutDifficulty>>;

export default function createPastaWithoutDifficulty(
  pasta: PastaWithoutDifficulty,
  // if you leave off checkState, all goals will be included
  checkState: null | Map<Game, boolean>
): PastaWithoutDifficulty {
  // if present, checkState should have all actual games in it, but not general
  // defaulting to true means general is always included
  const allGoals = pasta.flat().filter((goal) => checkState?.get(goal.types[0]) ?? true);
  shuffle(allGoals);
  // Nozzlo and Blitz have 25 general goals which are mixed in with everything else
  // so we don't actually need to verify that there are >= 25 goals.
  const finalPasta: MutablePasta = [];
  for (let i = 0; i < 25; i++) {
    finalPasta.push([]);
  }
  allGoals.forEach((goal, index) => finalPasta[index % 25].push(goal));
  return finalPasta;
}
