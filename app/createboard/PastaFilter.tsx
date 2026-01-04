import { useEffect, useMemo, useState } from "react";
import { Alert, Group, NumberInput, Stack, Text } from "@mantine/core";
import createPasta from "./createPasta";
import GameChecker from "./GameChecker";
import getDefaultDifficulties from "./getDefaultDifficulties";
import { Difficulty, DIFFICULTY_NAMES, Game } from "../goals";
import { Pasta } from "../pastas/metadata";
import { CheckerSort } from "./CheckerSortSelector";

type Props = {
  checkState: Map<Game, boolean>;
  setCheckState: (newState: Map<Game, boolean>) => void;
  pasta: Pasta;
  onChangePasta: (newPasta: null | Pasta) => void;
  sort: CheckerSort,
  setSort: (newSort: CheckerSort) => unknown;
};

export default function PastaFilter({
  pasta,
  checkState,
  setCheckState,
  onChangePasta,
  sort,
  setSort,
}: Props) {
  const [difficultyCount, setDifficultyCount] = useState<
    Map<Difficulty, number>
  >(getDefaultDifficulties(pasta));
  const difficultySum = difficultyCount
    .values()
    .reduce((acc, next) => acc + next, 0);

  const filteredPasta = useMemo(
    () =>
      pasta.map((group) =>
        group.filter((goal) => {
          return (
            goal.types[0] === "general" ||
            (checkState.get(goal.types[0]) ?? false)
          );
        })
      ),
    [pasta, checkState]
  );

  const availableGoalDifficultyCounts = useMemo(() => {
    const counts = new Map<Difficulty, number>([]);
    filteredPasta.forEach((group) =>
      group.forEach((goal) =>
        counts.set(goal.types[1], (counts.get(goal.types[1]) ?? 0) + 1)
      )
    );
    return counts;
  }, [filteredPasta]);

  const hasWrongSum = difficultySum != 25;
  const hasTooFewGoals = difficultyCount
    .entries()
    .some(
      ([difficulty, count]) =>
        (availableGoalDifficultyCounts.get(difficulty) ?? 0) < count
    );

  useEffect(() => {
    onChangePasta(
      hasWrongSum || hasTooFewGoals
        ? null
        : createPasta(filteredPasta, difficultyCount)
    );
  }, [
    hasWrongSum,
    hasTooFewGoals,
    filteredPasta,
    difficultyCount,
    onChangePasta,
  ]);
  return (
    <Stack>
      <GameChecker checkState={checkState} setCheckState={setCheckState} sort={sort} setSort={setSort} />
      <Text>
        <strong>Choose difficulty distribution</strong>
      </Text>
      <Group wrap="nowrap">
        {Array.from(
          difficultyCount.entries().map(([key, count]) => (
            <NumberInput
              key={key}
              label={DIFFICULTY_NAMES[key]}
              description={`${availableGoalDifficultyCounts.get(key) ?? 0
                } available`}
              clampBehavior="strict"
              min={0}
              value={count}
              onChange={(newCount) => {
                if (typeof newCount === "number") {
                  const newDifficultyCount = new Map(difficultyCount);
                  newDifficultyCount.set(key, newCount);
                  setDifficultyCount(newDifficultyCount);
                }
              }}
            />
          ))
        )}
      </Group>
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
    </Stack>
  );
}
