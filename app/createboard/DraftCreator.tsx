import { useEffect, useMemo, useState } from "react";
import { Alert, Group, NumberInput, Stack, Text } from "@mantine/core";
import { Difficulty, DIFFICULTY_NAMES, Game } from "../goals";
import { GoalWithDifficulty, Pasta } from "../pastas/metadata";
import DraftChecker from "./DraftChecker";
import createDraftPasta from "./createDraftPasta";
import { CheckerSort } from "./CheckerSortSelector";

export type PlayerToDifficultyToGameToGoal = Array<
  Map<Difficulty, Map<Game, GoalWithDifficulty[]>>
>;

type Props = {
  draftCheckState: Map<Game, null | number>;
  setDraftCheckState: (newState: Map<Game, null | number>) => void;
  numPlayers: number;
  setNumPlayers: (newNumPlayers: number) => void;
  pasta: Pasta;
  onChangePasta: (newPasta: null | Pasta) => void;
  sort: CheckerSort,
  setSort: (newSort: CheckerSort) => unknown;
};

export default function DraftCreator({
  pasta,
  draftCheckState,
  setDraftCheckState,
  onChangePasta,
  numPlayers,
  setNumPlayers,
  sort,
  setSort,
}: Props) {
  const [numGenerals, setNumGenerals] = useState(0);
  const [rawDifficultyCountsByPlayer, setDifficultyCountsByPlayer] = useState<
    ReadonlyArray<Map<Difficulty, number>>
  >([
    new Map([
      ["easy", 3],
      ["medium", 3],
      ["hard", 3],
      ["veryhard", 3],
    ]),
    new Map([
      ["easy", 4],
      ["medium", 4],
      ["hard", 3],
      ["veryhard", 2],
    ]),
    new Map([
      ["easy", 0],
      ["medium", 0],
      ["hard", 0],
      ["veryhard", 0],
    ]),
    new Map([
      ["easy", 0],
      ["medium", 0],
      ["hard", 0],
      ["veryhard", 0],
    ]),
    new Map([
      ["easy", 0],
      ["medium", 0],
      ["hard", 0],
      ["veryhard", 0],
    ]),
  ]);
  const difficultyCountsByPlayer = useMemo(
    () => rawDifficultyCountsByPlayer.slice(0, numPlayers),
    [rawDifficultyCountsByPlayer, numPlayers]
  );

  const difficultySum = difficultyCountsByPlayer.reduce(
    (acc, difficultyCount) =>
      acc +
      difficultyCount.values().reduce((playerAcc, next) => playerAcc + next, 0),
    numGenerals
  );

  const playerToDifficultyToGameToGoal =
    useMemo<PlayerToDifficultyToGameToGoal>(() => {
      const finalValue: PlayerToDifficultyToGameToGoal =
        difficultyCountsByPlayer.map((_) => new Map());
      pasta.forEach((group) =>
        group.forEach((goal) => {
          const game = goal.types[0];
          const difficulty = goal.types[1];
          if (difficulty === "general" || game === "general") {
            return;
          }
          const checkedPlayer = draftCheckState.get(game);
          if (checkedPlayer == null) {
            return;
          }
          const playerMap = finalValue[checkedPlayer] ?? new Map();
          const gameMap = playerMap.get(difficulty) ?? new Map();
          const goalsArray = gameMap.get(game) ?? [];
          goalsArray.push(goal);
          gameMap.set(game, goalsArray);
          playerMap.set(difficulty, gameMap);
          finalValue[checkedPlayer] = playerMap;
        })
      );
      return finalValue;
    }, [difficultyCountsByPlayer, draftCheckState, pasta]);

  const playerToAvailableGoalDifficultyCounts = useMemo(
    () =>
      playerToDifficultyToGameToGoal.map((playerMap) => {
        const counts = new Map<Difficulty, number>([
          ["easy", 0],
          ["medium", 0],
          ["hard", 0],
          ["veryhard", 0],
        ]);
        playerMap.forEach((gameMap, difficulty) => {
          let count = 0;
          gameMap.forEach((goals) => (count += goals.length));
          counts.set(difficulty, count);
        });
        return counts;
      }),
    [playerToDifficultyToGameToGoal]
  );

  const hasWrongSum = difficultySum != 25;
  const hasTooFewGoals = playerToAvailableGoalDifficultyCounts.some(
    (difficultyCounts, playerIndex) =>
      difficultyCounts
        .entries()
        .some(
          ([difficulty, availableCount]) =>
            availableCount <
            (difficultyCountsByPlayer[playerIndex].get(difficulty) ?? 0)
        )
  );

  useEffect(() => {
    onChangePasta(
      hasWrongSum || hasTooFewGoals
        ? null
        : createDraftPasta(
          pasta,
          numGenerals,
          playerToDifficultyToGameToGoal,
          difficultyCountsByPlayer
        )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasWrongSum,
    hasTooFewGoals,
    pasta,
    numGenerals,
    playerToDifficultyToGameToGoal,
    difficultyCountsByPlayer,
  ]);
  return (
    <Stack>
      <Alert title="Standard Draft">
        To construct a Standard Draft game, one player should share their view
        of this page, and then players should alternate drafting games up to the
        agreed upon limit. If desired, players can then protect/ban games.
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
        draftCheckState={draftCheckState}
        setDraftCheckState={setDraftCheckState}
        numPlayers={numPlayers}
        sort={sort}
        setSort={setSort}
      />
      <Text>
        <strong>Choose difficulty distribution</strong>
      </Text>
      <NumberInput
        label="General"
        description="General goals are not guaranteed to be completable with the games you've selected. If you're including General goals, please have a caster or admin verify the board before playing."
        clampBehavior="strict"
        min={0}
        value={numGenerals}
        allowDecimal={false}
        allowNegative={false}
        onChange={(newNumGenerals: string | number) => {
          if (typeof newNumGenerals === "number") {
            setNumGenerals(newNumGenerals);
          }
        }}
      />
      {difficultyCountsByPlayer.map((difficultyCount, playerIndex) => (
        <Group key={playerIndex} wrap="nowrap">
          {Array.from(
            difficultyCount.entries().map(([difficulty, count]) => {
              const availableCount =
                playerToAvailableGoalDifficultyCounts[playerIndex].get(
                  difficulty
                ) ?? 0;
              return (
                <NumberInput
                  key={difficulty}
                  label={`P${playerIndex + 1} ${DIFFICULTY_NAMES[difficulty]}`}
                  description={`${availableCount} available`}
                  clampBehavior="strict"
                  min={0}
                  value={count}
                  onChange={(newCount) => {
                    if (typeof newCount === "number") {
                      const newDifficultyCount = new Map(difficultyCount);
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
            })
          )}
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
    </Stack>
  );
}
