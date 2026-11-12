import { NeonQueryFunction } from "@neondatabase/serverless";
import { SQL } from "./matches/page";
import { BingosyncColor } from "./matches/parseBingosyncData";
import { SyncedTimerEventName } from "./room/[id]/common/useSyncedTimer";
import getSql from "./getSql";

export type FeedColorMark = {
  type: "color_mark";
  userId: number;
  color: BingosyncColor;
  squareIndex: number;
  time: number;
  isClear: boolean;
};

export type FeedChat = {
  type: "chat";
  userId: number;
  time: number;
  message: string;
  visibleToPlayers: null | ReadonlyArray<number>;
};

export type FeedTimerEvent = {
  type: "timer_event";
  userId: number;
  time: number;
  event: SyncedTimerEventName;
  duration: null | number;
};

export type FeedMember = {
  type: "member";
  userId: number;
  time: number;
  playerColor: null | BingosyncColor;
  isInvite: boolean;
  name: string;
};

export type NewFeedItem =
  | FeedColorMark
  | FeedChat
  | FeedTimerEvent
  | FeedMember;

export type NewFeed = ReadonlyArray<NewFeedItem>;

type FeedFetchPairs = [SQL, (result: SQLResult) => ReadonlyArray<NewFeedItem>];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SQLResult = ReadonlyArray<Record<string, any>>;

export type SQLTemplate = NeonQueryFunction<false, false>;

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
    userId: Number(raw.user_id),
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
    userId: Number(raw.user_id),
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
    userId: Number(raw.user_id),
    time: Number(raw.unixtime),
    event: raw.event,
    duration: raw.duration,
  }));
}

export function fetchMemberSql(sql: SQLTemplate, gameId: number): SQL {
  return sql`
    SELECT
      EXTRACT(EPOCH FROM member.time)::DOUBLE PRECISION AS unixtime,
      member.user_id,
      member.player_color,
      member.is_invite,
      COALESCE(member.override_name, "user".name) AS final_name
    FROM member
    INNER JOIN "user"
    ON member.user_id = "user".id
    WHERE game_id = ${gameId}
  `;
}

export function parseMemberResult(result: SQLResult): Array<FeedMember> {
  return result.map((raw) => ({
    type: "member",
    userId: Number(raw.user_id),
    time: Number(raw.unixtime),
    playerColor: raw.player_color,
    isInvite: raw.is_invite,
    name: raw.final_name,
  }));
}

function fetchSquareNamesSql(sql: SQLTemplate, gameId: number): SQL {
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

export async function fetchData(
  gameId: number,
  memberFeed: ReadonlyArray<FeedMember>,
  isPlay: boolean,
): Promise<{ squareNames: ReadonlyArray<string>; feed: NewFeed }> {
  const sql = getSql(false);
  const feedFetchPairs: ReadonlyArray<FeedFetchPairs> = [
    [fetchColorMarkSql(sql, gameId), parseColorMarkResult],
    [fetchChatSql(sql, gameId), parseChatResult],
    [fetchTimerEventSql(sql, gameId), parseTimerEventResult],
  ];
  if (!isPlay) {
    // add some more stuff to the feed fetch
  }
  const results = await sql.transaction([
    ...feedFetchPairs.map((pair) => pair[0]),
    fetchSquareNamesSql(sql, gameId),
  ]);
  const feedResults = results.slice(0, feedFetchPairs.length);
  const otherResults = results.slice(feedFetchPairs.length);
  const feed = feedResults
    .flatMap((result, index) => feedFetchPairs[index][1](result))
    .concat(memberFeed);
  feed.sort((a, b) => a.time - b.time);

  const squareNames = parseSquareNames(otherResults[0]);
  return { squareNames, feed };
}
