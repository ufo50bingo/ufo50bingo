import { Card, Stack } from "@mantine/core";
import ChatInput from "./ChatInput";
import { CSSProperties, useLayoutEffect, useMemo, useRef } from "react";
import FeedEntry from "./FeedEntry";
import { NewFeed } from "@/app/fetchFeed";
import { GenericMember, PlayerMember } from "./useMembers";

type Props = {
  userId: number;
  feed: NewFeed;
  members: ReadonlyMap<number, GenericMember>;
  style?: CSSProperties;
  isPlay: boolean;
  squareNames: ReadonlyArray<string>;
  players: ReadonlyArray<PlayerMember>;
};

export default function Feed({
  feed,
  userId,
  isPlay,
  squareNames,
  members,
  players,
  style = {},
}: Props) {
  const feedRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (feedRef.current != null) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [feed]);

  const filteredFeed = useMemo(
    () =>
      feed.filter(
        (item) =>
          !isPlay ||
          item.type !== "chat" ||
          item.visibleToPlayers == null ||
          item.userId === userId ||
          item.visibleToPlayers.includes(userId),
      ),
    [feed, isPlay, userId],
  );
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
          {filteredFeed.map((entry, index) => (
            <FeedEntry
              key={index}
              entry={entry}
              squareNames={squareNames}
              members={members}
            />
          ))}
        </Stack>
      </Card.Section>
      <Card.Section inheritPadding={true} withBorder={true} py="sm">
        <ChatInput userId={userId} players={players} />
      </Card.Section>
    </Card>
  );
}
