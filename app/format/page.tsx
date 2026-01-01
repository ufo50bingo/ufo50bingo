import {
  Card,
  Code,
  Container,
  Divider,
  List,
  ListItem,
  Title,
} from "@mantine/core";

export default function Format() {
  return (
    <Container my="md">
      <Card
        style={{ alignItems: "flex-start" }}
        shadow="sm"
        padding="sm"
        radius="md"
        withBorder
      >
        <Title order={1}>UFO Pasta Format</Title>
        <Divider my="md" />
        <Title order={2}>Intro</Title>
        <p>
          The UFO pasta format is a powerful new way to manage bingo goals. It
          was developed specifically for UFO 50, but it can be used for
          anything! Compared to SRLv5, the UFO format has many benefits:
        </p>
        <List>
          <ListItem>
            Supports goals with tokens. Your goals can include special tokens
            like "HOT FOOT: Gold disk with {"{{"}hotfoot_char{"}}"} and {"{{"}
            hotfoot_char{"}}"}". In another section of the config you specify
            something like "hotfoot_char": ["Edgar", "July", "Amy"] and it will
            randomly select two characters to put into the goal text.
          </ListItem>
          <ListItem>
            Better randomization. Instead of specifying 25 different groups of
            goals, you specify your goals in categories (like "easy", "medium",
            etc--but you can use whatever category name you want) and then
            choose how many goals you want from each category. This allows for
            much greater board variety and easier management.
          </ListItem>
          <ListItem>
            Better synergy avoidance. This normally doesn't matter for standard
            games, but in custom or draft games the SRLv5 generator would
            sometimes put multiple goals from the same game on a bingo line
            together. The UFO generator will basically never do this.
          </ListItem>
          <ListItem>
            Much more compact. The new standard pasta is about 50% of the size
            of the old one.
          </ListItem>
          <ListItem>
            Built-in validations. When you paste in the Custom box it will
            automatically validate your config and tell you if anything is
            wrong.
          </ListItem>
        </List>
        <Title order={2}>Specification</Title>
        <p>
          The UFO format is a standard JSON object. It expects the following
          keys:
        </p>
        <List>
          <ListItem>
            <Code color="var(--mantine-color-blue-light)">goals</Code>
            <List>
              <ListItem>Something</ListItem>
            </List>
          </ListItem>
          <ListItem>
            <Code color="var(--mantine-color-blue-light)">tokens</Code>
          </ListItem>
          <ListItem>
            <Code color="var(--mantine-color-blue-light)">category_counts</Code>
          </ListItem>
          <ListItem>
            <Code color="var(--mantine-color-blue-light)">
              categories_with_global_group_repeat_prevention
            </Code>
          </ListItem>
          <ListItem>
            <Code color="var(--mantine-color-blue-light)">
              category_difficulty_tiers
            </Code>
          </ListItem>
        </List>
      </Card>
    </Container>
  );
}
