import { Game, GAME_NAMES, GoalName } from "@/app/goals";
import { Card, List, Title } from "@mantine/core";
import { ReactNode } from "react";
import { GOLD_TIMES, CHERRY_TIMES, GIFT_TIMES } from "./timeEstimates";

type Props = {
  allGames: Set<Game>;
  name: GoalName;
};

const GIFTS = /Collect \d+ gifts from games on this card/i;
const GOLD_DISKS = /Collect \d+ gold disks from games on this card/i;
const CHERRY_DISKS = /Collect \d+ cherry disks from games on this card/i;

export default function GeneralGoal({ allGames, name }: Props) {
  let content: ReactNode = "No info for this goal yet!";
  if (GIFTS.test(name)) {
    content = (
      <List>
        {GIFT_TIMES.filter((entry) => allGames.has(entry[0])).map((entry) => (
          <List.Item key={entry[0]}>{GAME_NAMES[entry[0]]}</List.Item>
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
        <Title order={5}>{name}</Title>
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
