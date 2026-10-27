import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import PlayWrapper from "./PlayWrapper";
import getSql from "@/app/getSql";
import { SQL } from "@/app/matches/page";
import { NeonQueryFunction } from "@neondatabase/serverless";

type Props = {
  gameId: number;
};

export default async function PlayPage({ gameId }: Props) {
  const [initialFeed] = await Promise.all([
    // fetchBoard(id, roomBackend),
    fetchNewFeed(Number(gameId)),
    // fetchFeed(id, bingosyncCookie, roomBackend),
    // fetchTimerEvents(id),
    // getSocketKey(id, bingosyncCookie, roomBackend),
    // getSeed(id, roomBackend),
  ]);
  return (
    <PlayWrapper
      gameId={gameId}
      initialFeed={initialFeed}
      userId={1}
      // initialTimerEvents={timerEvents}
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

export type NewFeedItem = FeedColorMark | FeedChat;

export type NewFeed = ReadonlyArray<NewFeedItem>;

type FetchParsePair = [SQL, (result: SQLResult) => ReadonlyArray<NewFeedItem>];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SQLResult = ReadonlyArray<Record<string, any>>;

type SQLTemplate = NeonQueryFunction<false, false>;

async function fetchNewFeed(gameId: number): Promise<NewFeed> {
  const sql = getSql(false);
  const fetchParsePairs: ReadonlyArray<FetchParsePair> = [
    [fetchColorMarkSql(sql, gameId), parseColorMarkResult],
    [fetchChatSql(sql, gameId), parseChatResult],
  ];
  const results = await sql.transaction(fetchParsePairs.map((pair) => pair[0]));
  const parsed = results.flatMap((result, index) =>
    fetchParsePairs[index][1](result),
  );
  parsed.sort((a, b) => a.time - b.time);
  return parsed;
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
