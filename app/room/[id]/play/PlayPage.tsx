import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import PlayWrapper from "./PlayWrapper";
import getSql from "@/app/getSql";
import { SQL } from "@/app/matches/page";
import { NeonQueryFunction } from "@neondatabase/serverless";
import { SyncedTimerEventName } from "../common/useSyncedTimer";
import getUserId from "@/app/getUserId";

type Props = {
  gameId: number;
};

export default async function PlayPage({ gameId }: Props) {
  const [userId, data] = await Promise.all([
    getUserId(),
    fetchData(Number(gameId)),
    // getSocketKey(id, bingosyncCookie, roomBackend),
  ]);
  return (
    <PlayWrapper
      gameId={gameId}
      initialFeed={data.feed}
      squareNames={data.squareNames}
      userId={userId}
    />
  );
}

type NewFeedUser = {
  id: number;
  // todo: fetch player names separately?
  name: string;
};

type FeedColorMark = {
  type: "color_mark";
  user: NewFeedUser;
  color: BingosyncColor;
  squareIndex: number;
  time: number;
  isClear: boolean;
};

type FeedChat = {
  type: "chat";
  user: NewFeedUser;
  time: number;
  message: string;
  visibleToPlayers: null | ReadonlyArray<number>;
};

export type FeedTimerEvent = {
  type: "timer_event";
  user: NewFeedUser;
  time: number;
  event: SyncedTimerEventName;
  duration: null | number;
};

export type NewFeedItem = FeedColorMark | FeedChat | FeedTimerEvent;

export type NewFeed = ReadonlyArray<NewFeedItem>;

type FeedFetchPairs = [SQL, (result: SQLResult) => ReadonlyArray<NewFeedItem>];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SQLResult = ReadonlyArray<Record<string, any>>;

type SQLTemplate = NeonQueryFunction<false, false>;

async function fetchData(
  gameId: number,
): Promise<{ squareNames: ReadonlyArray<string>; feed: NewFeed }> {
  const sql = getSql(false);
  const feedFetchPairs: ReadonlyArray<FeedFetchPairs> = [
    [fetchColorMarkSql(sql, gameId), parseColorMarkResult],
    [fetchChatSql(sql, gameId), parseChatResult],
    [fetchTimerEventSql(sql, gameId), parseTimerEventResult],
  ];
  const results = await sql.transaction([
    ...feedFetchPairs.map((pair) => pair[0]),
    fetchSquareTextSql(sql, gameId),
  ]);
  const feedResults = results.slice(0, feedFetchPairs.length);
  const otherResults = results.slice(feedFetchPairs.length);
  const feed = feedResults.flatMap((result, index) =>
    feedFetchPairs[index][1](result),
  );
  feed.sort((a, b) => a.time - b.time);

  const squareNames = parseSquareNames(otherResults[0]);
  return { squareNames, feed };
}

function fetchSquareTextSql(sql: SQLTemplate, gameId: number): SQL {
  return sql`
    SELECT
      goal_text.name
    FROM game_goal
    INNER JOIN goal_text
    ON game_goal.goal_id = goal_text.id
    WHERE game_goal.game_id = ${gameId}
    ORDER BY game_goal.square_index
  `;
}

function parseSquareNames(result: SQLResult): ReadonlyArray<string> {
  return result.map((raw) => raw.name);
}

function fetchColorMarkSql(sql: SQLTemplate, gameId: number): SQL {
  return sql`
    SELECT
      EXTRACT(EPOCH FROM time)::DOUBLE PRECISION AS unixtime,
      user_id,
      square_index,
      color,
      is_clear
    FROM color_mark
    WHERE game_id = ${gameId}
  `;
}

function parseColorMarkResult(result: SQLResult): Array<FeedColorMark> {
  return result.map((raw) => ({
    type: "color_mark",
    user: {
      id: Number(raw.user_id),
      name: "Unknown",
    },
    squareIndex: raw.square_index,
    time: Number(raw.unixtime),
    color: raw.color,
    isClear: Boolean(raw.is_clear),
  }));
}

function fetchChatSql(sql: SQLTemplate, gameId: number): SQL {
  return sql`
    SELECT
      EXTRACT(EPOCH FROM time)::DOUBLE PRECISION AS unixtime,
      user_id,
      message,
      visible_to_players
    FROM chat
    WHERE game_id = ${gameId}
  `;
}

function parseChatResult(result: SQLResult): Array<FeedChat> {
  return result.map((raw) => ({
    type: "chat",
    user: {
      id: Number(raw.user_id),
      name: "Unknown",
    },
    time: Number(raw.unixtime),
    message: String(raw.message),
    visibleToPlayers: raw.visible_to_players,
  }));
}

function fetchTimerEventSql(sql: SQLTemplate, gameId: number): SQL {
  return sql`
    SELECT
      EXTRACT(EPOCH FROM time)::DOUBLE PRECISION AS unixtime,
      user_id,
      event,
      duration
    FROM timer_event
    WHERE game_id = ${gameId}
  `;
}

function parseTimerEventResult(result: SQLResult): Array<FeedTimerEvent> {
  return result.map((raw) => ({
    type: "timer_event",
    user: {
      id: Number(raw.user_id),
      name: "Unknown",
    },
    time: Number(raw.unixtime),
    event: raw.event,
    duration: raw.duration,
  }));
}
