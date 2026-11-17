import { Card, Stack } from "@mantine/core";
import ChatInput from "./ChatInput";
import { CSSProperties, useLayoutEffect, useMemo, useRef } from "react";
import FeedEntry from "./FeedEntry";
import { NewFeed, NewFeedItem } from "@/app/fetchFeed";
import { GenericMember, PlayerMember } from "./useMembers";
import FeedBuilder from "./FeedBuilder";
import { BoardStateParams } from "@/app/match/[id]/BoardState";

type Props = {
  userId: null | number;
  feed: NewFeed;
  members: ReadonlyMap<number, GenericMember>;
  style?: CSSProperties;
  isPlay: boolean;
  boardStateParams: BoardStateParams;
  squareNames: ReadonlyArray<string>;
  players: ReadonlyArray<PlayerMember>;
  sendEvents:
    null | ((newEvent: ReadonlyArray<NewFeedItem>) => Promise<boolean>);
  getEntryLink?: null | ((time: number) => string);
};

export default function Feed({
  feed,
  userId,
  isPlay,
  squareNames,
  boardStateParams,
  members,
  players,
  sendEvents,
  style = {},
  getEntryLink,
}: Props) {
  const feedRef = useRef<HTMLDivElement>(null);
  const displayedFeed = useMemo(
    () => FeedBuilder.getDisplayedFeed(boardStateParams, squareNames, feed),
    [boardStateParams, squareNames, feed],
  );

  const filteredFeed = useMemo(
    () =>
      displayedFeed.filter(
        (item) =>
          !isPlay ||
          item.type !== "chat" ||
          item.visibleToPlayerIds == null ||
          item.userId === userId ||
          (userId !== null && item.visibleToPlayerIds.includes(userId)),
      ),
    [displayedFeed, isPlay, userId],
  );

  useLayoutEffect(() => {
    if (feedRef.current != null) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [filteredFeed.length]);

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
              members={members}
              link={getEntryLink != null ? getEntryLink(entry.time) : null}
            />
          ))}
        </Stack>
      </Card.Section>
      {sendEvents != null && userId != null && (
        <Card.Section inheritPadding={true} withBorder={true} py="sm">
          <ChatInput
            userId={userId}
            players={players}
            sendEvents={sendEvents}
          />
        </Card.Section>
      )}
    </Card>
  );
}
