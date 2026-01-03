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
                      0
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
    case "Collect {{cherry_count}} cherry disks from games on this card":
      return `Cherry (${goal.tokens[0]})`;
    case "Collect {{gold_count}} gold disks from games on this card":
      return `Gold (${goal.tokens[0]})`;
    case "Collect {{gift_count}} gifts from games on this card":
      return `Gifts (${goal.tokens[0]})`;
    case "ARCADE ACE: Gold Disk any 3 of the 16 “ARCADE” games":
      return "Arcade (3)";
    case "TRIATHLON: Gold Disk any 3 of the 5 “SPORT” games":
      return "Sport (3)";
    case "Collect a beverage in 6 games":
      return "Beverage (6)";
    case "Collect a food item in 8 games":
      return "Food (8)";
    case "Beat 2 levels in 8 different games":
      return "2 levels (8)";
    case "Beat 4 levels in 5 different games":
      return "4 levels (5)";
    case "Beat 8 levels in 3 different games":
      return "8 levels (3)";
    case "Collect a key in 7 games":
      return "Key (7)";
    case "Open 2 chests in 5 games":
      return "2 chests (5)";
    case "Buy an item from a shop in 10 games":
      return "Shop (10)";
    case "Find an easter egg UFO in 5 games":
      return "UFO (5)";
    case "Earn an extra life/1UP in 8 games":
      return "1UP (8)";
    case "Find an egg in 10 games":
      return "Egg (10)";
    case "Increase your base HP in 6 games":
      return "HP (6)";
    case "Defeat 2 bosses in 4 different games":
      return "2 bosses (4)";
    case "Defeat 7 bosses":
      return "Bosses (7)";
    case "Defeat a boss in 6 different games":
      return "Bosses (6)";
    // case "Enter a top 3 score on 2 arcade leaderboards":
    // case "Enter a top 3 score on 3 arcade leaderboards":
    case "Enter a top 5 score on 4 arcade leaderboards":
      return "Top 5 (4)";
    case "PILOT PARTY: Collect 4 gifts: Campanella 1/2/3, Planet Zoldath, Pilot Quest, The Big Bell Race":
      return "Pilot Party (4)";
    case "ALPHA TRILOGY: Gold Velgress, Overbold, and Quibble Race as Alpha":
      return "Alpha (3)";
    case "AMY: Playing as Amy, beat 1 level in Party House, 2 in Hot Foot, 2 in Fist Hell":
      return "Amy (3)";
    case "CAMPANELLA TRILOGY: Beat two worlds in Campanella, two in Campanella 2, one in Campanella 3":
      return "Campanella (3)";
    case "DAY JOB: Beat 1 level in Bug Hunter, 2 in Onion Delivery, 3 in Rail Heist":
      return "Day Job (3)";
    case "METROIDVANIA: Collect Abilities: 3 in Porgy, 2 in Vainger, 1 in Golfaria":
      return "Metroidvania (3)";
    case "PUZZLER: Beat 5 levels in Block Koala, Camouflage, Warptank":
      return "Puzzler (3)";
    case "RACER: Win 4 races in Paint Chase, The Big Bell Race, Quibble Race":
      return "Racer (3)";
    case "ROLE-PLAYER: Level up all your characters twice in Divers, Valbrace, Grimstone":
      return "Role-player (3)";
    case "WAR IS BAD: Win 3 battles in Attactics, Avianos, Combatants":
      return "War is Bad (3)";
    default:
      return goal.resolvedGoal;
  }
}
