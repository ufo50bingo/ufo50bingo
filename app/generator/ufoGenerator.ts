import shuffle from "../createboard/shuffle";
import { findGamesForResult } from "../room/[id]/cast/findAllGames";
import getGoalAndFallback from "./getGoalAndFallback";
import getMagicSquare from "./getMagicSquare";
import replaceTokens from "./replaceTokens";
import splitAtTokens from "./splitAtTokens";

export type UFOGoalConfig<T extends string = string> = {
  name: T;
  restriction?: {
    count: number;
    fallback: string;
    options: string | ReadonlyArray<string>;
  };
  sort_tokens?: string | ReadonlyArray<string>;
};

export type UFOGameGoals = {
  [game: string]: ReadonlyArray<string | UFOGoalConfig>;
};

export type UFODifficulties = { [difficulty: string]: UFOGameGoals };

export type Tokens = { [token: string]: ReadonlyArray<string> };

export type Counts = { [difficulty: string]: number };

export type UFOPasta = {
  goals: UFODifficulties;
  tokens: Tokens;
  category_counts: Counts;
  categories_with_global_group_repeat_prevention?: ReadonlyArray<string>;
  category_difficulty_tiers?: ReadonlyArray<ReadonlyArray<string>>;
  restriction_option_lists?: {
    [listName: string]: ReadonlyArray<string>;
  };
  sort_orders?: {
    [sortName: string]: ReadonlyArray<string>;
  };
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
  const difficultyTiers =
    pasta.category_difficulty_tiers ??
    Object.keys(pasta.category_counts).map((category) => [category]);
  const orderedCategories = difficultyTiers.flatMap((tier) => {
    const categories = tier.flatMap((category) =>
      Array(pasta.category_counts[category]).fill(category),
    );
    if (tier.length > 1) {
      shuffle(categories);
    }
    return categories;
  });
  const difficultyByIndex: Array<string> = magicSquare.map(
    (index) => orderedCategories[index],
  );

  const availableGamesByDifficulty: { [difficulty: string]: Array<string> } =
    {};
  const gameByIndex: Array<string> = Array(25).fill("");
  const finalBoard: Array<string | null> = Array(25).fill(null);
  const finalBoardWithTokens: Array<string | null> = Array(25).fill(null);
  const difficultyToGameToUsedCount: {
    [difficulty: string]: { [game: string]: number };
  } = {};
  fillOrder.forEach((index) => {
    const difficulty = difficultyByIndex[index];
    const synergyCheckIndices =
      pasta.categories_with_global_group_repeat_prevention != null &&
        pasta.categories_with_global_group_repeat_prevention.includes(difficulty)
        ? [...Array(25)].map((_, x) => x)
        : SAME_LINE_INDICES[index];

    let bestSynergy = Infinity;
    let bestGame = null;
    const gameToGoals = pasta.goals[difficulty];
    const curCountByGame = difficultyToGameToUsedCount[difficulty] ?? {};

    let games = availableGamesByDifficulty[difficulty];
    if (games == null || games.length < 1) {
      games = Object.keys(gameToGoals).filter(game => gameToGoals[game].length > (curCountByGame[game] ?? 0));
      shuffle(games);
    }
    for (const game of games) {
      const synergy = synergyCheckIndices.reduce(
        (acc, checkGame) => (gameByIndex[checkGame] === game ? acc + 1 : acc),
        0,
      );
      if (synergy > bestSynergy) {
        continue;
      }
      bestSynergy = synergy;
      bestGame = game;
      if (synergy === 0) {
        break;
      }
    }
    if (bestGame == null) {
      throw new Error(
        `Failed to generate card! Not enough goals for difficulty ${difficulty}.`,
      );
    }
    const curCount = curCountByGame[bestGame] ?? 0;
    curCountByGame[bestGame] = curCount + 1;
    difficultyToGameToUsedCount[difficulty] = curCountByGame;
    gameByIndex[index] = bestGame;
    availableGamesByDifficulty[difficulty] = games.filter(
      (g) => g !== bestGame,
    );
  });

  const gamesOnCard = new Set<string>();

  const unrestricted: Array<number> = [];
  const restricted: Array<number> = [];
  for (let i = 0; i < 25; i++) {
    const difficulty = difficultyByIndex[i];
    const game = gameByIndex[i];
    const goals = pasta.goals[difficulty][game];
    if (goals.every((goal) => typeof goal === "string")) {
      unrestricted.push(i);
    } else {
      restricted.push(i);
    }
  }

  const fillIndex = (i: number) => {
    let finalGoal = null;
    const game = gameByIndex[i];
    const difficulty = difficultyByIndex[i];
    const goals = [...pasta.goals[difficulty][game]];
    let fallback: null | string = null;
    let sortTokens: null | undefined | string | ReadonlyArray<string> = null;
    shuffle(goals);
    for (const goal of goals) {
      const goalAndFallback = getGoalAndFallback(goal);
      if (
        finalBoard.includes(goalAndFallback[0]) ||
        (goalAndFallback[1] != null && finalBoard.includes(goalAndFallback[1]))
      ) {
        continue;
      }
      if (typeof goal === "object" && goal.restriction != null) {
        const optionsRaw = goal.restriction.options;
        const options =
          typeof optionsRaw === "string"
            ? pasta.restriction_option_lists![optionsRaw]
            : optionsRaw;
        const onCardCount = options.filter((option) =>
          gamesOnCard.has(option),
        ).length;
        if (onCardCount < goal.restriction.count) {
          if (fallback == null) {
            fallback = goalAndFallback[1];
          }
          continue;
        }
      }
      if (typeof goal === "object") {
        sortTokens = goal?.sort_tokens;
      }
      finalGoal = goalAndFallback[0];
      break;
    }

    if (finalGoal == null) {
      finalGoal = fallback ?? "ERROR: Failed to find goal";
    }

    finalBoard[i] = finalGoal;
    finalBoardWithTokens[i] = replaceTokens(finalGoal, pasta, sortTokens);
    for (const onCard of findGamesForResult(finalBoardWithTokens[i], {
      subcategory: game,
    })) {
      gamesOnCard.add(onCard);
    }
  };

  for (const i of unrestricted) {
    fillIndex(i);
  }

  const restrictedWithNewGames: Array<number> = [];
  const restrictedWithoutNewGames: Array<number> = [];

  for (const i of restricted) {
    const game = gameByIndex[i];
    const difficulty = difficultyByIndex[i];
    const goals = pasta.goals[difficulty][game];

    const mayHaveNewGame = goals.some((goal) => {
      const goalAndFallback = getGoalAndFallback(goal);
      for (const g of goalAndFallback) {
        for (const testGame of findGamesForResult(g, { subcategory: game })) {
          if (!gamesOnCard.has(testGame)) {
            return true;
          }
        }
        const tokens = splitAtTokens(g).filter((item) => item.type === "token");
        for (const token of tokens) {
          for (const option of pasta.tokens[token.token]) {
            for (const testGame of findGamesForResult(option, null)) {
              if (!gamesOnCard.has(testGame)) {
                return true;
              }
            }
          }
        }
      }
    });
    if (mayHaveNewGame) {
      restrictedWithNewGames.push(i);
    } else {
      restrictedWithoutNewGames.push(i);
    }
  }

  for (const i of restrictedWithoutNewGames) {
    fillIndex(i);
  }

  for (const i of restrictedWithNewGames) {
    fillIndex(i);
  }

  return finalBoardWithTokens as Array<string>;
}
