import { useEffect, useMemo, useState } from "react";
import { Alert, Group, NumberInput, Stack, Text } from "@mantine/core";
import DraftChecker from "./DraftChecker";
import { Counts, UFODifficulties, UFOPasta } from "../generator/ufoGenerator";
import { CheckerSort } from "./CheckerSortSelector";
import getCategoryName from "../generator/getCategoryName";
import { IconAlertSquareRounded } from "@tabler/icons-react";
import { BoardSize } from "./NonLeagueMatch";
import BoardSizeSelectors from "./BoardSizeSelectors";
import scaleCounts from "./scaleCounts";

type Props = {
  draftCheckState: Map<string, number>;
  setDraftCheckState: (newState: Map<string, number>) => void;
  numPlayers: number;
  setNumPlayers: (newNumPlayers: number) => void;
  pasta: UFOPasta;
  onChangePasta: (newPasta: null | UFOPasta) => void;
  sort: CheckerSort;
  setSort: (newSort: CheckerSort) => unknown;
  excludedGames?: ReadonlySet<string>;
  boardSize: BoardSize;
  setBoardSize: (newBoardSize: BoardSize) => unknown;
};

export default function UFODraftCreator({
  pasta,
  draftCheckState,
  setDraftCheckState,
  onChangePasta,
  numPlayers,
  setNumPlayers,
  sort,
  setSort,
  excludedGames,
  boardSize,
  setBoardSize,
}: Props) {
  // TODO: Maybe order these based on category_counts
  const draftCategories = useMemo(() => {
    return Object.keys(pasta.goals).filter(
      (cat) =>
        pasta.draft == null || !pasta.draft.excluded_categories.includes(cat),
    );
  }, [pasta]);
  const excludedCategories = useMemo(() => {
    return Object.keys(pasta.goals).filter(
      (cat) =>
        pasta.draft != null && pasta.draft.excluded_categories.includes(cat),
    );
  }, [pasta]);
  const [excludedCounts, setExcludedCounts] = useState<Map<string, number>>(
    new Map(excludedCategories.map((category) => [category, 0])),
  );
  const [rawDifficultyCountsByPlayer, setDifficultyCountsByPlayer] = useState<
    ReadonlyArray<Map<string, number>>
  >(
    getDefaultDifficultyCounts(pasta, boardSize.rows, boardSize.cols).map(
      (counts) => new Map(Object.entries(counts)),
    ),
  );
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDifficultyCountsByPlayer(
      getDefaultDifficultyCounts(pasta, boardSize.rows, boardSize.cols).map(
        (counts) => new Map(Object.entries(counts)),
      ),
    );
  }, [boardSize.rows, boardSize.cols, pasta]);
  const difficultyCountsByPlayer = useMemo(
    () => rawDifficultyCountsByPlayer.slice(0, numPlayers),
    [rawDifficultyCountsByPlayer, numPlayers],
  );

  const playerDifficultySum = difficultyCountsByPlayer.reduce(
    (acc, difficultyCount) =>
      acc +
      difficultyCount.values().reduce((playerAcc, next) => playerAcc + next, 0),
    0,
  );
  const excludedDifficultySum = excludedCounts
    .values()
    .reduce((acc, next) => acc + next, 0);
  const difficultySum = playerDifficultySum + excludedDifficultySum;

  const allPlayersHaveDifficulty = [...Array(numPlayers)].every(
    (_, playerIndex) =>
      difficultyCountsByPlayer[playerIndex] != null &&
      difficultyCountsByPlayer[playerIndex].values().some((count) => count > 0),
  );

  const customizedPasta: UFOPasta = useMemo(() => {
    const finalGoals: UFODifficulties = {};
    draftCategories.forEach((category) => {
      Object.keys(pasta.goals[category]).map((group) => {
        const checkedPlayer = draftCheckState.get(group);
        if (
          checkedPlayer == null ||
          (excludedGames != null && excludedGames.has(group))
        ) {
          return;
        }
        const categoryName = getCategoryKey(checkedPlayer, category);
        const categoryGoals = finalGoals[categoryName] ?? {};
        categoryGoals[group] = pasta.goals[category][group];
        finalGoals[categoryName] = categoryGoals;
      });
    });
    excludedCategories.forEach((category) => {
      finalGoals[category] = pasta.goals[category];
    });
    const categoryCounts: { [category: string]: number } = {};
    difficultyCountsByPlayer.entries().forEach(([playerNum, counts]) => {
      counts.entries().forEach(([category, count]) => {
        categoryCounts[getCategoryKey(playerNum, category)] = count;
      });
    });
    excludedCategories.forEach((category) => {
      categoryCounts[category] = excludedCounts.get(category) ?? 0;
    });
    const tiers = draftCategories.map((difficulty) =>
      [...Array(numPlayers)].map((_, playerNum) =>
        getCategoryKey(playerNum, difficulty),
      ),
    );
    excludedCategories.forEach((category) => {
      tiers.push([category]);
    });
    return {
      ...pasta,
      goals: finalGoals,
      category_counts: categoryCounts,
      category_difficulty_tiers: tiers,
    };
  }, [
    difficultyCountsByPlayer,
    draftCategories,
    draftCheckState,
    excludedCategories,
    excludedCounts,
    excludedGames,
    numPlayers,
    pasta,
  ]);

  const playerToAvailableGoalDifficultyCounts = useMemo(
    () =>
      [...Array(numPlayers)].map((_, playerNum) => {
        const counts = new Map<string, number>([]);
        draftCategories.forEach((difficulty) => {
          const goals =
            customizedPasta.goals[getCategoryKey(playerNum, difficulty)] ?? [];
          const count = Object.values(goals).reduce(
            (acc, gameGoals) => acc + gameGoals.length,
            0,
          );
          counts.set(difficulty, count);
        });
        return counts;
      }),
    [customizedPasta.goals, draftCategories, numPlayers],
  );

  const hasWrongSum = difficultySum != boardSize.rows * boardSize.cols;
  const hasTooFewGoals = playerToAvailableGoalDifficultyCounts.some(
    (difficultyCounts, playerIndex) =>
      difficultyCounts
        .entries()
        .some(
          ([difficulty, availableCount]) =>
            availableCount <
            (difficultyCountsByPlayer[playerIndex]?.get(difficulty) ?? 0),
        ),
  );

  useEffect(() => {
    onChangePasta(
      hasWrongSum || hasTooFewGoals || !allPlayersHaveDifficulty
        ? null
        : customizedPasta,
    );
  }, [
    allPlayersHaveDifficulty,
    customizedPasta,
    hasTooFewGoals,
    hasWrongSum,
    onChangePasta,
  ]);
  return (
    <Stack>
      <NumberInput
        label="Number of players (2-5)"
        clampBehavior="strict"
        value={numPlayers}
        allowDecimal={false}
        allowNegative={false}
        min={2}
        max={5}
        onChange={(newNumPlayers: string | number) => {
          if (typeof newNumPlayers === "number") {
            setNumPlayers(newNumPlayers as number);
          }
        }}
      />
      <DraftChecker
        draftCategories={draftCategories}
        draftCheckState={draftCheckState}
        setDraftCheckState={setDraftCheckState}
        numPlayers={numPlayers}
        pasta={pasta}
        sort={sort}
        setSort={setSort}
        excludedGames={excludedGames}
      />
      <BoardSizeSelectors boardSize={boardSize} setBoardSize={setBoardSize} />
      <Text>
        <strong>Choose difficulty distribution</strong>
      </Text>
      <Group>
        {excludedCategories.map((category) => (
          <NumberInput
            w={100}
            key={category}
            label={getCategoryName(category)}
            clampBehavior="strict"
            min={0}
            value={excludedCounts.get(category) ?? 0}
            allowDecimal={false}
            allowNegative={false}
            onChange={(newNumExcluded: string | number) => {
              if (typeof newNumExcluded === "number") {
                const newMap = new Map(excludedCounts);
                newMap.set(category, newNumExcluded);
                setExcludedCounts(newMap);
              }
            }}
          />
        ))}
      </Group>
      {excludedDifficultySum > 0 && (
        <Alert color="yellow" icon={<IconAlertSquareRounded />}>
          General goals are not guaranteed to be completable. You may want to
          have a caster or admin verify the board before playing.
        </Alert>
      )}
      {[...Array(numPlayers)].map((_, playerIndex) => (
        <Group key={playerIndex}>
          {draftCategories.map((difficulty) => {
            const availableCount =
              playerToAvailableGoalDifficultyCounts[playerIndex].get(
                difficulty,
              ) ?? 0;
            return (
              <NumberInput
                key={difficulty}
                w={100}
                label={`P${playerIndex + 1} ${getCategoryName(difficulty)}`}
                description={`${availableCount} available`}
                clampBehavior="strict"
                min={0}
                value={
                  difficultyCountsByPlayer[playerIndex]?.get(difficulty) ?? 0
                }
                onChange={(newCount) => {
                  if (typeof newCount === "number") {
                    const newDifficultyCount = new Map(
                      difficultyCountsByPlayer[playerIndex],
                    );
                    newDifficultyCount.set(difficulty, newCount);
                    const newDifficultyCountsByPlayer = [
                      ...rawDifficultyCountsByPlayer,
                    ];
                    newDifficultyCountsByPlayer[playerIndex] =
                      newDifficultyCount;
                    setDifficultyCountsByPlayer(newDifficultyCountsByPlayer);
                  }
                }}
              />
            );
          })}
        </Group>
      ))}
      {hasWrongSum && (
        <Alert
          variant="light"
          color="red"
          title={`Error: Difficulty counts must sum to ${boardSize.rows * boardSize.cols}`}
        />
      )}
      {hasTooFewGoals && (
        <Alert
          variant="light"
          color="red"
          title="Error: One of your difficulties has a higher count than the number of available goals"
        />
      )}
      {!allPlayersHaveDifficulty && (
        <Alert
          variant="light"
          color="red"
          title="Error: One of your players has no difficulty counts selected"
        />
      )}
    </Stack>
  );
}

function getCategoryKey(playerNum: number, category: string): string {
  return `p${playerNum}-${category}`;
}

function getDefaultDifficultyCounts(
  pasta: UFOPasta,
  rows: number,
  cols: number,
): ReadonlyArray<Counts> {
  const draft = pasta.draft;
  if (draft == null) {
    return [pasta.category_counts, pasta.category_counts];
  }
  if (rows === 5 && cols === 5) {
    return draft.category_counts;
  }
  const foundConfig = draft.other_category_counts?.find(
    (config) => config.rows === rows && config.cols === cols,
  );
  if (foundConfig != null) {
    return foundConfig.category_counts;
  }
  const transformedCounts: Counts = {};
  for (const [idx, counts] of draft.category_counts.entries()) {
    for (const [category, count] of Object.entries(counts)) {
      const key = getCategoryKey(idx, category);
      transformedCounts[key] = count;
    }
  }
  const scaledCounts = scaleCounts(transformedCounts, rows * cols);

  const finalCounts: Array<Counts> = [];
  for (const [idx, counts] of draft.category_counts.entries()) {
    const newPlayerCounts: Counts = {};
    for (const category of Object.keys(counts)) {
      const key = getCategoryKey(idx, category);
      newPlayerCounts[category] = scaledCounts[key];
    }
    finalCounts.push(newPlayerCounts);
  }
  return finalCounts;
}
