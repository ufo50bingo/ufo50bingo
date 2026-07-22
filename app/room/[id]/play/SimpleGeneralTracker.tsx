import InfoCard from "../cast/InfoCard";
import { Button, Group, Stack, Text, Tooltip } from "@mantine/core";
import useSimpleGeneralState from "./useSimpleGeneralState";
import { GeneralItem } from "../cast/Cast";

type Props = {
  generalGoals: ReadonlyArray<GeneralItem>;
  id: string;
  seed: number;
  isHidden: boolean;
};

export default function SimpleGeneralTracker({
  generalGoals,
  id,
  seed,
  isHidden,
}: Props) {
  const [state, setState] = useSimpleGeneralState(id, seed);
  return (
    <InfoCard maxWidth={525} height={148}>
      <Stack gap={4}>
        {generalGoals.map((item) => {
          const displayGoal =
            item.foundGoal.short?.resolved ?? item.foundGoal.resolvedGoal;
          return (
            <Group
              key={item.foundGoal.resolvedGoal}
              gap={6}
              justify="space-between"
            >
              <Tooltip
                label={isHidden ? "<Hidden>" : item.foundGoal.resolvedGoal}
              >
                <Text size="sm">
                  {item.color !== "blank" ? (
                    isHidden ? (
                      "<Hidden>"
                    ) : (
                      <s>{displayGoal}</s>
                    )
                  ) : isHidden ? (
                    "<Hidden>"
                  ) : (
                    displayGoal
                  )}
                </Text>
              </Tooltip>
              <Group gap={4}>
                <Button
                  variant="subtle"
                  h={18}
                  w={18}
                  p={0}
                  size="compact-xs"
                  onClick={() => {
                    setState({
                      ...state,
                      [item.foundGoal.resolvedGoal]: Math.max(
                        (state[item.foundGoal.resolvedGoal] ?? 0) - 1,
                        0,
                      ),
                    });
                  }}
                >
                  -
                </Button>
                <Text w={14} ta="center" size="sm">
                  {state[item.foundGoal.resolvedGoal] ?? 0}
                </Text>
                <Button
                  variant="subtle"
                  h={18}
                  w={18}
                  p={0}
                  size="compact-xs"
                  onClick={() => {
                    setState({
                      ...state,
                      [item.foundGoal.resolvedGoal]:
                        (state[item.foundGoal.resolvedGoal] ?? 0) + 1,
                    });
                  }}
                >
                  +
                </Button>
              </Group>
            </Group>
          );
        })}
      </Stack>
    </InfoCard>
  );
}
