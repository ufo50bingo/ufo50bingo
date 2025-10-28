import { GoalName } from "@/app/goals";
import InfoCard from "../cast/InfoCard";
import { Square } from "@/app/matches/parseBingosyncData";
import { Button, Group, Stack, Text, Tooltip } from "@mantine/core";
import useSimpleGeneralState from "./useSimpleGeneralState";

type Props = {
    generalGoals: ReadonlyArray<Square>;
    id: string;
    seed: number;
};

export default function SimpleGeneralTracker({ generalGoals, id, seed }: Props) {
    const key = `${id}-${seed}`;
    const [state, setState] = useSimpleGeneralState(id, seed);
    console.log(state);
    return (
        <InfoCard width={525} height={140}>
            <Stack gap={4}>
                {generalGoals.map(goal => (
                    <Group key={goal.name} gap={6} justify="space-between">
                        <Tooltip label={goal.name}>
                            <Text size="sm">
                                {goal.color !== "blank"
                                    ? <s>{getAbbreviatedName(goal.name as GoalName)}</s>
                                    : getAbbreviatedName(goal.name as GoalName)
                                }
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
                                        [goal.name]: Math.max((state[goal.name] ?? 0) - 1, 0),
                                    });
                                }}
                            >
                                -
                            </Button>
                            <Text w={14} ta="center" size="sm">{state[goal.name] ?? 0}</Text>
                            <Button
                                variant="subtle"
                                h={18}
                                w={18}
                                p={0}
                                size="compact-xs"
                                onClick={() => {
                                    setState({
                                        ...state,
                                        [goal.name]: (state[goal.name] ?? 0) + 1,
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

function getAbbreviatedName(goal: GoalName): string {
    switch (goal) {
        case "Collect 2 cherry disks from games on this card":
            return "Cherry (2)";
        case "Collect 3 cherry disks from games on this card":
            return "Cherry (3)";
        case "Collect 3 gold disks from games on this card":
            return "Gold (3)";
        case "Collect 4 gold disks from games on this card":
            return "Gold (4)";
        case "Collect 6 gifts from games on this card":
            return "Gift (6)";
        case "Collect 7 gifts from games on this card":
            return "Gift (7)";
        case "Collect 8 gifts from games on this card":
            return "Gift (8)";
        case "ARCADE ACE: Gold Disk any 3 of the 16 “ARCADE” games":
            return "Arcade (3)";
        case "TRIATHLON: Gold Disk any 3 of the 5 “SPORT” games":
            return "Sport (3)";
        case "Collect a beverage in 6 games":
            return "Beverage (6)";
        case "Collect a food item in 8 games":
            return "Food (8)";
        case "Beat 2 levels in 8 different games":
            return "2 levels (8)"
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
            return "2 bosses (4)"
        case "Defeat 7 bosses":
            return "Bosses (7)"
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
            return goal;
    }
}