import InfoCard from "../cast/InfoCard";
import { Button, Group, Stack, Text, Tooltip } from "@mantine/core";
import useSimpleGeneralState from "./useSimpleGeneralState";
import { FoundStandardGeneral, GeneralItem } from "../cast/Cast";

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
        {generalGoals.map((item) => (
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
                    <s>{getAbbreviatedName(item.foundGoal)}</s>
                  )
                ) : isHidden ? (
                  "<Hidden>"
                ) : (
                  getAbbreviatedName(item.foundGoal)
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
        ))}
      </Stack>
    </InfoCard>
  );
}

function getAbbreviatedName(goal: FoundStandardGeneral): string {
  switch (goal.goal) {
    // GIFT
    case "Collect {{gift_count}} gifts from games on this card":
      return `Gifts (${goal.tokens[0]})`;
    // GOLD/CHERRY
    case "Cherry disk {{cherry_count}} games on this card":
      return `Cherry (${goal.tokens[0]})`;
    case "Gold disk {{gold_count}} games on this card":
      return `Gold (${goal.tokens[0]})`;
    // BOSS/LEVEL
    case "Beat 2 levels in 6 games on this card":
      return "2 levels (6)";
    case "Beat 4 levels in 5 games on this card":
      return "4 levels (5)";
    case "Beat 8 levels in 3 games on this card":
      return "8 levels (3)";
    case "Defeat 2 bosses in 3 games on this card":
      return "2 bosses (3)";
    case "Defeat 7 bosses from games on this card":
      return "Bosses (7)";
    case "Defeat a boss in 5 games on this card":
      return "Boss (5)";
    // COLLECTATHON
    case "Collect 2 keys in 5 games":
      return "2 keys (5)";
    case "Open 2 chests in 5 games":
      return "2 chests (5)";
    case "Buy an item from 2 unique shops in one run in 6 games":
      return "2 shops (6)";
    case "Earn 2 extra lives/1-Ups in 5 games":
      return "2 extra lives (5)";
    case "Increase your base HP twice in 4 games":
      return "2 HP (4)";
    case "Surpass the top 5 score from 4 arcade leaderboards":
      return "Top 5 (4)";
    case "Defeat 6 different enemy types in 6 games":
      return "6 enemy types (6)";
    // THEME
    case "CAMPANELLA TRILOGY: Beat 5 total worlds across Campanella 1, 2, and 3":
      return "Camp Trilogy (5 worlds)";
    case "SHOOTER: Beat 5 waves/stages across Elfazar's Hat, Seaside Drive, and Caramel Caramel":
      return "Shooter (5 waves/stages)";
    case "DAY JOB: Beat 9 levels across Rail Heist, Onion Delivery, and Bug Hunter":
      return "Day Job (9 levels)";
    case "RACER: Win 12 races across Paint Chase, The Big Bell Race, and Quibble Race":
      return "Racer (12 races)";
    case "PUZZLER: Beat 15 levels across Block Koala, Devilition, and Warptank":
      return "Puzzler (15 levels)";
    case "AMY: Beat 5 levels across Party House, Fist Hell, and Hot Foot":
      return "Amy (5 levels)";
    case "WAR IS BAD: Win 9 battles across Attactics, Avianos, and Combatants":
      return "War Is Bad (9 battles)";
    case "METROIDVANIA: Collect 6 abilities across Porgy, Vainger, and Golfaria":
      return "Metroidvania (6 abilities)";
    default:
      return goal.resolvedGoal;
  }
}
