import { RawFeed } from "@/app/matches/parseBingosyncData";
import { Card, Stack } from "@mantine/core";
import ChatInput from "./ChatInput";
import { useLayoutEffect, useRef } from "react";
import FeedEntry from "./FeedEntry";

type Props = {
  rawFeed: RawFeed;
  height?: string;
};

export default function Feed({ rawFeed, height = '475px' }: Props) {
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
      style={{ width: "356px", height }}
    >
      <Card.Section
        ref={feedRef}
        inheritPadding={true}
        withBorder={true}
        py="sm"
        style={{ height: "100%", overflowY: "auto" }}
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
