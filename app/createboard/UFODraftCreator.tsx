import { useEffect, useMemo, useState } from "react";
import { Alert, Group, NumberInput, Stack, Text } from "@mantine/core";
import DraftChecker from "./DraftChecker";
import { UFODifficulties, UFOPasta } from "../generator/ufoGenerator";
import { CheckerSort } from "./CheckerSortSelector";
import getCategoryName from "../generator/getCategoryName";
import { IconAlertSquareRounded } from "@tabler/icons-react";

type Props = {
  draftCheckState: Map<string, number>;
  setDraftCheckState: (newState: Map<string, number>) => void;
  numPlayers: number;
  setNumPlayers: (newNumPlayers: number) => void;
  pasta: UFOPasta;
  onChangePasta: (newPasta: null | UFOPasta) => void;
  sort: CheckerSort;
  setSort: (newSort: CheckerSort) => unknown;
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
}: Props) {
  const draft = pasta.draft!;
  // TODO: Maybe order these based on category_counts
  const draftCategories = useMemo(() => {
    return Object.keys(pasta.goals).filter(
      (cat) => !draft.excluded_categories.includes(cat),
    );
  }, [pasta, draft]);
  const excludedCategories = useMemo(() => {
    return Object.keys(pasta.goals).filter((cat) =>
      draft.excluded_categories.includes(cat),
    );
  }, [pasta, draft]);
  const [excludedCounts, setExcludedCounts] = useState<Map<string, number>>(
    new Map(excludedCategories.map((category) => [category, 0])),
  );
  const [rawDifficultyCountsByPlayer, setDifficultyCountsByPlayer] = useState<
    ReadonlyArray<Map<string, number>>
  >(draft.category_counts.map((counts) => new Map(Object.entries(counts))));
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
        if (checkedPlayer == null) {
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

  const hasWrongSum = difficultySum != 25;
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
      <Alert>
        To construct a Draft game, one player should share their view of this
        page, and then players should alternate drafting games up to the agreed
        upon limit. If desired, players can then protect/ban games.
        <br />
        <br />
        For each game, the first checkbox indicates whether the first player has
        drafted the game, and so on.
        <br />
        Each game can be drafted by only one player.
        <br />
        <br />
        If you want to play with more than 2 players,{" "}
        <u>
          <strong>
            you must also manually update the difficulty counts below the game
            selector
          </strong>
        </u>
        .
      </Alert>
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
      />
      <Text>
        <strong>Choose difficulty distribution</strong>
      </Text>
      <Group>
        {excludedCategories.map((category) => (
          <NumberInput
            w={100}
            key="category"
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
          title="Error: Difficulty counts must sum to 25"
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
