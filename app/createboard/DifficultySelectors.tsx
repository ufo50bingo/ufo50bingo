import { Alert, Group, NumberInput, Stack, Text } from "@mantine/core";
import { Counts } from "../generator/ufoGenerator";
import { DIFFICULTY_NAMES } from "../goals";

const NAMES: { [difficulty: string]: string } = DIFFICULTY_NAMES;

type Props = {
  counts: Counts;
  setCounts: (newCounts: Counts) => unknown;
  availableCounts: Counts;
};

export default function DifficultySelectors({
  counts,
  setCounts,
  availableCounts,
}: Props) {
  const sum = Object.keys(counts).reduce((acc, key) => acc + counts[key], 0);
  const hasEnoughGoals = Object.keys(counts).every(
    (key) => (availableCounts[key] ?? 0) >= counts[key]
  );

  return (
    <Stack>
      <Text>
        <strong>Choose difficulty distribution</strong>
      </Text>
      <Group wrap="nowrap">
        {Array.from(
          Object.keys(counts).map((difficulty) => (
            <NumberInput
              key={difficulty}
              label={NAMES[difficulty] ?? difficulty}
              description={`${availableCounts[difficulty] ?? 0} available`}
              clampBehavior="strict"
              min={0}
              value={counts[difficulty]}
              onChange={(newCount) => {
                if (typeof newCount === "number") {
                  const newCounts = { ...counts };
                  newCounts[difficulty] = newCount;
                  setCounts(newCounts);
                }
              }}
            />
          ))
        )}
      </Group>
      {sum !== 25 && (
        <Alert
          variant="light"
          color="red"
          title="Error: Difficulty counts must sum to 25"
        />
      )}
      {!hasEnoughGoals && (
        <Alert
          variant="light"
          color="red"
          title="Error: One of your difficulties has a higher count than the number of available goals"
        />
      )}
    </Stack>
  );
}
