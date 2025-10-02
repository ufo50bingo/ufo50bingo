import { RawFeed } from "@/app/matches/parseBingosyncData";
import { Card, Stack } from "@mantine/core";
import FeedEntry from "./FeedEntry";
import ChatInput from "./ChatInput";
import { useLayoutEffect, useRef } from "react";

type Props = {
  cookie: string;
  rawFeed: RawFeed;
};

export default function Feed({ cookie, rawFeed }: Props) {
  const feedRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (feedRef.current != null) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [rawFeed]);
  return (
    <Card
      shadow="sm"
      padding="sm"
      radius="md"
      withBorder={true}
      style={{ maxWidth: "356px" }}
    >
      <Card.Section
        ref={feedRef}
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
        <ChatInput cookie={cookie} />
      </Card.Section>
    </Card>
  );
}
