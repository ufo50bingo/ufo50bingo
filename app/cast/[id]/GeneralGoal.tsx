import { Game, GAME_NAMES, GoalName } from "@/app/goals";
import { Card, List, Title } from "@mantine/core";
import { ReactNode } from "react";
import {
  GOLD_TIMES,
  CHERRY_TIMES,
  GIFT_TIMES,
  TOP_3,
  TOP_5,
} from "./timeEstimates";

type Props = {
  isChecked: boolean;
  allGames: Set<Game>;
  name: GoalName;
};

const GIFTS = /Collect \d+ gifts from games on this card/i;
const GOLD_DISKS = /Collect \d+ gold disks from games on this card/i;
const CHERRY_DISKS = /Collect \d+ cherry disks from games on this card/i;

export default function GeneralGoal({ allGames, name, isChecked }: Props) {
  let content: ReactNode = "No info for this goal yet!";
  // switch (name) {
  //   case "Collect 2 cherry disks from games on this card":
  //   case "Collect 3 cherry disks from games on this card":
  //   case "Collect 4 cherry disks from games on this card":
  //     break;
  //   case "Collect 3 gold disks from games on this card":
  //   case "Collect 4 gold disks from games on this card":
  //   case "Collect 5 gold disks from games on this card":
  //     break;
  //   case "Collect 4 gifts from games on this card":
  //   case "Collect 6 gifts from games on this card":
  //   case "Collect 8 gifts from games on this card":
  //     break;
  //   case "ARCADE ACE: Gold Disk any 3 of the 16 “ARCADE” games":
  //     break;
  //   case "TRIATHLON: Gold Disk any 3 of the 5 “SPORT” games":
  //     break;
  //   case "Collect a beverage in 6 games":
  //   case "Collect a food item in 8 games":
  //     break;
  //   case "Beat 2 levels in 8 different games":
  //   case "Beat 4 levels in 5 different games":
  //   case "Beat 8 levels in 3 different games":
  //     // needs sort still
  //     break;
  //   case "Collect a key in 7 games":
  //   case "Open 2 chests in 5 games":
  //     break;
  //   case "Buy an item from a shop in 10 games":
  //     break;
  //   case "Find an easter egg UFO in 5 games":
  //     break;
  //   case "Earn an extra life/1UP in 8 games":
  //     break;
  //   case "Find an egg in 10 games":
  //     break;
  //   case "Increase your base HP in 6 games":
  //     break;

  //   case "Defeat 2 bosses in 4 different games":
  //   case "Defeat 7 bosses":
  //   case "Defeat a boss in 6 different games":
  //     break;

  //   case "PILOT PARTY: Collect 4 gifts: Campanella 1/2/3, Planet Zoldath, Pilot Quest, The Big Bell Race":

  //   case "ALPHA TRILOGY: Gold Velgress, Overbold, and Quibble Race as Alpha":
  //   case "AMY: Playing as Amy, beat 1 level in Party House, 2 in Hot Foot, 2 in Fist Hell":
  //   case "CAMPANELLA TRILOGY: Beat two worlds in Campanella, two in Campanella 2, one in Campanella 3":
  //   case "DAY JOB: Beat 1 level in Bug Hunter, 2 in Onion Delivery, 3 in Rail Heist":
  //   case "METROIDVANIA: Collect Abilities: 3 in Porgy, 2 in Vainger, 1 in Golfaria":
  //   case "PUZZLER: Beat 5 levels in Block Koala, Camouflage, Warptank":
  //   case "RACER: Win 4 races in Paint Chase, The Big Bell Race, Quibble Race":
  //   case "ROLE-PLAYER: Level up all your characters twice in Divers, Valbrace, Grimstone":
  //   case "WAR IS BAD: Win 3 battles in Attactics, Avianos, Combatants":
  //     break;
  // }
  if (GIFTS.test(name)) {
    content = (
      <List>
        {GIFT_TIMES.filter((entry) => allGames.has(entry[0])).map((entry) => (
          <List.Item key={entry[0]}>
            {GAME_NAMES[entry[0]]} ({entry[1]})
          </List.Item>
        ))}
      </List>
    );
  } else if (GOLD_DISKS.test(name)) {
    content = (
      <List>
        {GOLD_TIMES.filter((entry) => allGames.has(entry[0])).map((entry) => (
          <List.Item key={entry[0]}>{GAME_NAMES[entry[0]]}</List.Item>
        ))}
      </List>
    );
  } else if (CHERRY_DISKS.test(name)) {
    content = (
      <List>
        {CHERRY_TIMES.filter((entry) => allGames.has(entry[0])).map((entry) => (
          <List.Item key={entry[0]}>{GAME_NAMES[entry[0]]}</List.Item>
        ))}
      </List>
    );
  } else if (
    name === "Enter a top 3 score on 2 arcade leaderboards" ||
    name === "Enter a top 3 score on 3 arcade leaderboards"
  ) {
    content = (
      <List>
        {TOP_3.map((entry) => (
          <List.Item key={entry[0]}>
            {GAME_NAMES[entry[0]]} ({entry[1]})
          </List.Item>
        ))}
      </List>
    );
  } else if (name === "Enter a top 5 score on 4 arcade leaderboards") {
    content = (
      <List>
        {TOP_5.map((entry) => (
          <List.Item key={entry[0]}>
            {GAME_NAMES[entry[0]]} ({entry[1]})
          </List.Item>
        ))}
      </List>
    );
  }
  return (
    <Card
      shadow="sm"
      padding="sm"
      radius="md"
      withBorder={true}
      style={{ height: "300px" }}
    >
      <Card.Section inheritPadding={true} withBorder={true} py="sm">
        <Title order={5}>{isChecked ? <s>{name}</s> : name}</Title>
      </Card.Section>
      <Card.Section
        inheritPadding={true}
        withBorder={true}
        py="sm"
        style={{ overflowY: "auto" }}
      >
        {content}
      </Card.Section>
    </Card>
  );
}
