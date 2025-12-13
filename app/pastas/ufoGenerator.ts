import shuffle from "../createboard/shuffle";
import getMagicSquare from "./getMagicSquare";
import replaceTokens from "./replaceTokens";

export type UFOGameGoals = { [game: string]: ReadonlyArray<string> };

export type UFODifficulties = { [difficulty: string]: UFOGameGoals };

export type Tokens = { [token: string]: ReadonlyArray<string> };

type Counts = { [difficulty: string]: number };

export type UFOPasta = {
  goals: UFODifficulties;
  tokens: Tokens;
  default_counts: Counts;
};

const SAME_LINE_INDICES = [
  [1, 2, 3, 4, 5, 10, 15, 20, 6, 12, 18, 24],
  [0, 2, 3, 4, 6, 11, 16, 21],
  [0, 1, 3, 4, 7, 12, 17, 22],
  [0, 1, 2, 4, 8, 13, 18, 23],
  [0, 1, 2, 3, 8, 12, 16, 20, 9, 14, 19, 24],
  [0, 10, 15, 20, 6, 7, 8, 9],
  [0, 12, 18, 24, 5, 7, 8, 9, 1, 11, 16, 21],
  [5, 6, 8, 9, 2, 12, 17, 22],
  [4, 12, 16, 20, 9, 7, 6, 5, 3, 13, 18, 23],
  [4, 14, 19, 24, 8, 7, 6, 5],
  [0, 5, 15, 20, 11, 12, 13, 14],
  [1, 6, 16, 21, 10, 12, 13, 14],
  [0, 6, 12, 18, 24, 20, 16, 8, 4, 2, 7, 17, 22, 10, 11, 13, 14],
  [3, 8, 18, 23, 10, 11, 12, 14],
  [4, 9, 19, 24, 10, 11, 12, 13],
  [0, 5, 10, 20, 16, 17, 18, 19],
  [15, 17, 18, 19, 1, 6, 11, 21, 20, 12, 8, 4],
  [15, 16, 18, 19, 2, 7, 12, 22],
  [15, 16, 17, 19, 23, 13, 8, 3, 24, 12, 6, 0],
  [4, 9, 14, 24, 15, 16, 17, 18],
  [0, 5, 10, 15, 16, 12, 8, 4, 21, 22, 23, 24],
  [20, 22, 23, 24, 1, 6, 11, 16],
  [2, 7, 12, 17, 20, 21, 23, 24],
  [20, 21, 22, 24, 3, 8, 13, 18],
  [0, 6, 12, 18, 20, 21, 22, 23, 19, 14, 9, 4],
];

export default function ufoGenerator(pasta: UFOPasta): ReadonlyArray<string> {
  // fill squares in order of how many bingo lines they're on
  // this helps prevent having two goals from the same game on one line
  const centerIndex = 12;
  const diagonalIndices = [0, 6, 18, 24, 4, 8, 16, 20];
  const remainingIndices = [
    1, 2, 3, 5, 7, 9, 10, 11, 13, 14, 15, 17, 19, 21, 22, 23,
  ];
  shuffle(diagonalIndices);
  shuffle(remainingIndices);
  const fillOrder = [centerIndex, ...diagonalIndices, ...remainingIndices];

  // choose difficulty of each square by using a magic square
  const magicSquare = getMagicSquare();
  const orderedDifficulties = Object.entries(pasta.default_counts).flatMap(
    ([difficulty, count]) => Array(count).fill(difficulty)
  );
  const difficultyByIndex = magicSquare.map(
    (index) => orderedDifficulties[index]
  );

  const gameByIndex: Array<string | null> = Array(25).fill(null);
  const finalBoard: Array<string | null> = Array(25).fill(null);
  fillOrder.forEach((index) => {
    const difficulty = difficultyByIndex[index];
    const synergyCheckIndices =
      difficulty === "general"
        ? [...Array(25)].map((_, x) => x)
        : SAME_LINE_INDICES[index];

    let bestSynergy = Infinity;
    let bestGame = null;
    let bestGoal = "ERROR: Failed to find goal";
    const gameToGoals = pasta.goals[difficulty];
    const games = Object.keys(gameToGoals);
    shuffle(games);
    for (const game of games) {
      const synergy = synergyCheckIndices.reduce(
        (acc, checkGame) => (gameByIndex[checkGame] === game ? acc + 1 : acc),
        0
      );
      if (synergy > bestSynergy) {
        continue;
      }
      const goals = [...gameToGoals[game]];
      shuffle(goals);
      for (const goal of goals) {
        if (!finalBoard.includes(goal)) {
          bestGoal = goal;
          bestSynergy = synergy;
          bestGame = game;
          break;
        }
      }
    }
    finalBoard[index] = bestGoal;
    gameByIndex[index] = bestGame;
  });

  return finalBoard.map(goal => replaceTokens(goal!, pasta.tokens));
}
