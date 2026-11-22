import getAllSubcategories from "../createboard/getAllSubcategories";
import getNonGeneralCategories from "../createboard/getNonGeneralCategories";
import shuffle from "../createboard/shuffle";
import { getTerminalCode } from "../room/[id]/cast/findAllGames";
import getBingoLines from "./getBingoLines";
import { getDifficultyLayout } from "./getDifficultyLayout";
import getGoalAndFallback from "./getGoalAndFallback";
import { inferGames } from "./inferGames";
import range from "./range";
import replaceTokens from "./replaceTokens";
import splitAtTokens from "./splitAtTokens";

export type OptionListEntry =
  | string
  | { type: "include" | "exclude"; has_extra: string; option: string };
export type OptionList = {
  shown: ReadonlyArray<OptionListEntry>;
  shown_if_on_card: ReadonlyArray<OptionListEntry>;
  hidden: ReadonlyArray<OptionListEntry>;
};
export type Descriptions = { [subcategory: string]: string };
export type CastConfig = {
  type: "check" | "counter";
  options: string | OptionList;
  on_card_only: boolean;
  image?: {
    src: string;
    is_pixel?: boolean;
  };
  descriptions?: string | Descriptions;
};

export type UFOGoalConfig<T extends string = string> = {
  name: T;
  short?: string;
  restriction?: {
    count: number;
    fallback: string;
    options: string | ReadonlyArray<RestrictionOption>;
  };
  sort_tokens?: string | ReadonlyArray<string>;
  cast?: CastConfig;
};

export type UFOGameGoals = {
  [game: string]: ReadonlyArray<string | UFOGoalConfig>;
};

export type UFODifficulties = { [difficulty: string]: UFOGameGoals };

export type Tokens = { [token: string]: ReadonlyArray<string> };

export type Counts = { [difficulty: string]: number };
export type OtherCounts = {
  rows: number;
  cols: number;
  category_counts: Counts;
};

type RestrictionOption = string | { option: string; if: string };

export type PlayerTrackerRestrictions = {
  allowed_difficulty_tags: null | ReadonlyArray<string>;
  allow_fast_sort: boolean;
  show_on_card_tooltips: boolean;
  show_multi_goal_games: boolean;
};

export interface UFOPasta {
  goals: UFODifficulties;
  tokens: Tokens;
  category_counts: Counts;
  other_category_counts?: ReadonlyArray<OtherCounts>;
  general_categories?: ReadonlyArray<string>;
  category_difficulty_tiers?: ReadonlyArray<ReadonlyArray<string>>;
  restriction_option_lists?: {
    [listName: string]: ReadonlyArray<RestrictionOption>;
  };
  sort_orders?: {
    [sortName: string]: ReadonlyArray<string>;
  };
  draft?: {
    excluded_categories: ReadonlyArray<string>;
    category_counts: ReadonlyArray<{ [category: string]: number }>;
  };
  current_game_options?: string | { [game: string]: string };
  player_tracker_restrictions?: PlayerTrackerRestrictions;
}

const MAX_TRIES = 100;
export default function ufoGenerator(
  pasta: UFOPasta,
  rows: number,
  cols: number,
): ReadonlyArray<string> {
  let bestBoard: null | ReadonlyArray<string> = null;
  let bestFallbacks = Infinity;
  let tryNum = 0;
  while (bestFallbacks > 0 && tryNum < MAX_TRIES) {
    tryNum += 1;
    const result = generateCandidate(pasta, bestFallbacks, rows, cols);
    if (result != null) {
      [bestBoard, bestFallbacks] = result;
    }
  }
  return bestBoard!;
}

function generateCandidate(
  pasta: UFOPasta,
  bestFallbacks: number,
  rows: number,
  cols: number,
): null | [ReadonlyArray<string>, number] {
  const nonGeneralCategories = getNonGeneralCategories(pasta);
  const allGames = [...getAllSubcategories(pasta.goals, nonGeneralCategories)];
  // fill squares in order of how many bingo lines they're on
  // this helps prevent having two goals from the same game on one line
  // TODO: should we add a more complex search algorithm here as well?
  const bingoLines = getBingoLines(rows, cols);
  const boardSize = rows * cols;
  const maybeCenterIndex =
    rows === cols && rows % 2 === 1 ? [(boardSize - 1) / 2] : [];
  const allDiagonalIndices = bingoLines.diagonals.flatMap(
    (cellIndex) => cellIndex,
  );
  const diagonalIndicesWithoutCenter = allDiagonalIndices.filter(
    (cellIndex) =>
      maybeCenterIndex.length === 0 || cellIndex !== maybeCenterIndex[0],
  );
  const remainingIndices = range(boardSize).filter(
    (cellIndex) => !allDiagonalIndices.includes(cellIndex),
  );
  shuffle(diagonalIndicesWithoutCenter);
  shuffle(remainingIndices);
  const fillOrder = [
    ...maybeCenterIndex,
    ...diagonalIndicesWithoutCenter,
    ...remainingIndices,
  ];

  const allBingoLines = bingoLines.rowsAndCols.concat(bingoLines.diagonals);
  const sameLineIndices = range(boardSize).map((_) => new Set<number>());
  for (const line of allBingoLines) {
    for (const cellToUpdate of line) {
      for (const otherCell of line) {
        if (cellToUpdate !== otherCell) {
          sameLineIndices[cellToUpdate].add(otherCell);
        }
      }
    }
  }

  const difficultyTiers =
    pasta.category_difficulty_tiers ??
    Object.keys(pasta.category_counts).map((category) => [category]);
  const tierCounts = difficultyTiers.map((tier) =>
    tier.reduce(
      (acc, difficulty) => acc + pasta.category_counts[difficulty],
      0,
    ),
  );
  const tierLayout = getDifficultyLayout(tierCounts, rows, cols).board;
  const categoriesByTier = difficultyTiers.map((tier) => {
    const categories: Array<string> = tier.flatMap((category) =>
      Array(pasta.category_counts[category]).fill(category),
    );
    if (tier.length > 1) {
      shuffle(categories);
    }
    return categories;
  });
  const difficultyByIndex: Array<string> = Array(boardSize).fill("");
  const indexForTiers: Array<number> = tierCounts.map((_) => 0);
  for (let cellIdx = 0; cellIdx < tierLayout.length; cellIdx++) {
    const tier = tierLayout[cellIdx];
    const catIdx = indexForTiers[tier];
    difficultyByIndex[cellIdx] = categoriesByTier[tier][catIdx];
    indexForTiers[tier]++;
  }

  const availableGamesByDifficulty: { [difficulty: string]: Array<string> } =
    {};
  const gameByIndex: Array<string> = Array(boardSize).fill("");
  const finalBoard: Array<string | null> = Array(boardSize).fill(null);
  const finalBoardWithTokens: Array<string | null> =
    Array(boardSize).fill(null);
  const difficultyToGameToUsedCount: {
    [difficulty: string]: { [game: string]: number };
  } = {};
  fillOrder.forEach((index) => {
    const difficulty = difficultyByIndex[index];

    let bestSynergy = Infinity;
    let bestGame = null;
    const gameToGoals = pasta.goals[difficulty];
    const curCountByGame = difficultyToGameToUsedCount[difficulty] ?? {};

    let games = availableGamesByDifficulty[difficulty];
    if (games == null || games.length < 1) {
      games = Object.keys(gameToGoals).filter(
        (game) => gameToGoals[game].length > (curCountByGame[game] ?? 0),
      );
      shuffle(games);
    }
    for (const game of games) {
      let synergy = 0;
      for (const sameLineIndex of sameLineIndices[index]) {
        if (gameByIndex[sameLineIndex] === game) {
          synergy += 1;
        }
      }
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
  const codesOnCard = new Set<string>();

  const unrestricted: Array<number> = [];
  const restricted: Array<number> = [];
  for (let i = 0; i < boardSize; i++) {
    const difficulty = difficultyByIndex[i];
    const game = gameByIndex[i];
    const goals = pasta.goals[difficulty][game];
    if (goals.every((goal) => typeof goal === "string")) {
      unrestricted.push(i);
    } else {
      restricted.push(i);
    }
  }

  let numFallbacks = 0;

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
        const onCardCount = options.filter((option) => {
          if (typeof option === "object") {
            return codesOnCard.has(option.if) && gamesOnCard.has(option.option);
          } else {
            return gamesOnCard.has(option);
          }
        }).length;
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
      numFallbacks += 1;
      finalGoal = fallback ?? "ERROR: Failed to find goal";
    }

    finalBoard[i] = finalGoal;
    finalBoardWithTokens[i] = replaceTokens(finalGoal, pasta, sortTokens);
    const isGeneral =
      difficulty === "general" ||
      (pasta.general_categories != null &&
        pasta.general_categories.includes(difficulty));
    if (!isGeneral) {
      gamesOnCard.add(game);
    } else {
      for (const onCard of inferGames(finalBoardWithTokens[i], allGames)) {
        gamesOnCard.add(onCard);
      }
    }
    const code = getTerminalCode(finalBoardWithTokens[i]);
    if (code != null) {
      codesOnCard.add(code);
    }
  };

  for (const i of unrestricted) {
    fillIndex(i);
    if (numFallbacks >= bestFallbacks) {
      return null;
    }
  }

  const restrictedWithNewGames: Array<number> = [];
  const restrictedWithoutNewGames: Array<number> = [];

  for (const i of restricted) {
    const game = gameByIndex[i];
    const difficulty = difficultyByIndex[i];
    const goals = pasta.goals[difficulty][game];

    const mayHaveNewGame = goals.some((goal) => {
      const isGeneral =
        difficulty === "general" ||
        (pasta.general_categories != null &&
          pasta.general_categories.includes(difficulty));
      if (!isGeneral) {
        return !gamesOnCard.has(game);
      }

      const goalAndFallback = getGoalAndFallback(goal);
      for (const g of goalAndFallback) {
        for (const testGame of inferGames(g, allGames)) {
          if (!gamesOnCard.has(testGame)) {
            return true;
          }
        }
        const tokens = splitAtTokens(g).filter((item) => item.type === "token");
        for (const token of tokens) {
          for (const option of pasta.tokens[token.token]) {
            for (const testGame of inferGames(option, allGames)) {
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

  for (const i of restrictedWithNewGames) {
    fillIndex(i);
    if (numFallbacks >= bestFallbacks) {
      return null;
    }
  }

  for (const i of restrictedWithoutNewGames) {
    fillIndex(i);
    if (numFallbacks >= bestFallbacks) {
      return null;
    }
  }

  return [finalBoardWithTokens as Array<string>, numFallbacks];
}
