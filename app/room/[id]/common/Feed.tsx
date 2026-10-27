import { Card, Stack } from "@mantine/core";
import ChatInput from "./ChatInput";
import { CSSProperties, useLayoutEffect, useRef } from "react";
import FeedEntry from "./FeedEntry";
import { NewFeed } from "../play/PlayPage";

type Props = {
  feed: NewFeed;
  style?: CSSProperties;
};

export default function Feed({ feed, style = {} }: Props) {
  const feedRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (feedRef.current != null) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [feed]);
  console.log(feed);
  return (
    <Card
      shadow="sm"
      padding="sm"
      radius="md"
      withBorder={true}
      style={{ width: "356px", resize: "both", ...style }}
    >
      <Card.Section
        ref={feedRef}
        inheritPadding={true}
        withBorder={true}
        py="sm"
        style={{ height: "100%", overflowY: "auto" }}
      >
        <Stack gap={0}>
          {feed.map((entry, index) => (
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
