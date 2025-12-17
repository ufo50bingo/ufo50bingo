import { useEffect, useMemo, useState } from "react";
import { Alert, Group, NumberInput, Stack, Text } from "@mantine/core";
import { Difficulty, DIFFICULTY_NAMES, Game, ProperGame } from "../goals";
import { GoalWithDifficulty } from "../pastas/metadata";
import DraftChecker from "./DraftChecker";
import { UFODifficulties, UFOPasta } from "../pastas/ufoGenerator";

export type PlayerToDifficultyToGameToGoal = Array<
  Map<Difficulty, Map<Game, GoalWithDifficulty[]>>
>;

const DIFFICULTIES: ReadonlyArray<Difficulty> = [
  "easy",
  "medium",
  "hard",
  "veryhard",
];

type Props = {
  draftCheckState: Map<Game, null | number>;
  setDraftCheckState: (newState: Map<Game, null | number>) => void;
  numPlayers: number;
  setNumPlayers: (newNumPlayers: number) => void;
  pasta: UFOPasta;
  onChangePasta: (newPasta: null | UFOPasta) => void;
};

export default function UFODraftCreator({
  pasta,
  draftCheckState,
  setDraftCheckState,
  onChangePasta,
  numPlayers,
  setNumPlayers,
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

  const customizedPasta: UFOPasta = useMemo(() => {
    const finalGoals: UFODifficulties = {};
    Object.keys(pasta.goals).map((category) => {
      Object.keys(pasta.goals[category]).map((group) => {
        // should remove the game typing here
        const checkedPlayer = draftCheckState.get(group as ProperGame);
        if (checkedPlayer == null) {
          return;
        }
        const categoryName = getCategoryName(checkedPlayer, category);
        const categoryGoals = finalGoals[categoryName] ?? {};
        categoryGoals[group] = pasta.goals[category][group];
        finalGoals[categoryName] = categoryGoals;
      });
    });
    finalGoals["general"] = pasta.goals["general"];
    const categoryCounts: { [category: string]: number } = {};
    difficultyCountsByPlayer.entries().forEach(([playerNum, counts]) => {
      counts.entries().forEach(([category, count]) => {
        categoryCounts[getCategoryName(playerNum, category)] = count;
      });
    });
    categoryCounts["general"] = numGenerals;
    const tiers = DIFFICULTIES.map((difficulty) =>
      [...Array(numPlayers)].map((_, playerNum) =>
        getCategoryName(playerNum, difficulty)
      )
    );
    tiers.push(["general"]);
    return {
      ...pasta,
      goals: finalGoals,
      category_counts: categoryCounts,
      category_difficulty_tiers: tiers,
    };
  }, [
    difficultyCountsByPlayer,
    draftCheckState,
    numGenerals,
    numPlayers,
    pasta,
  ]);

  const playerToAvailableGoalDifficultyCounts = useMemo(
    () =>
      [...Array(numPlayers)].map((_, playerNum) => {
        const counts = new Map<Difficulty, number>([]);
        DIFFICULTIES.forEach((difficulty: Difficulty) => {
          const goals =
            customizedPasta.goals[getCategoryName(playerNum, difficulty)] ?? [];
          const count = Object.values(goals).reduce(
            (acc, gameGoals) => acc + gameGoals.length,
            0
          );
          counts.set(difficulty, count);
        });
        return counts;
      }),
    [customizedPasta.goals, numPlayers]
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
    onChangePasta(hasWrongSum || hasTooFewGoals ? null : customizedPasta);
  }, [customizedPasta, hasTooFewGoals, hasWrongSum, onChangePasta]);
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

function getCategoryName(playerNum: number, category: string): string {
  return `p${playerNum}-${category}`;
}
