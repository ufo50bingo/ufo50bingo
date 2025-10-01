import { RawFeed } from "@/app/matches/parseBingosyncData";
import { Card, Stack } from "@mantine/core";
import FeedEntry from "./FeedEntry";
import ChatInput from "./ChatInput";

type Props = {
  rawFeed: RawFeed;
};

export default function Feed({ rawFeed }: Props) {
  return (
    <Card
      shadow="sm"
      padding="sm"
      radius="md"
      withBorder={true}
      style={{ maxWidth: "356px" }}
    >
      <Card.Section
        inheritPadding={true}
        withBorder={true}
        py="sm"
        style={{ height: "475px", overflowY: "auto" }}
      >
        <Stack gap={0}>
          {rawFeed.events.map((entry, index) => (
            <FeedEntry key={index} entry={entry} />
          ))}
        </Stack>
      </Card.Section>
      <Card.Section inheritPadding={true} withBorder={true} py="sm">
        <ChatInput />
      </Card.Section>
    </Card>
  );
}
