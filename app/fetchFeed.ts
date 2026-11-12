import { NeonQueryFunction } from "@neondatabase/serverless";
import { SQL } from "./matches/page";
import { BingosyncColor } from "./matches/parseBingosyncData";
import { SyncedTimerEventName } from "./room/[id]/common/useSyncedTimer";
import getSql from "./getSql";
import { fetchPasta } from "./pastaStorage";
import { UFOPasta } from "./generator/ufoGenerator";
import getAllSubcategories from "./createboard/getAllSubcategories";
import getNonGeneralCategories from "./createboard/getNonGeneralCategories";
import joinValues from "./joinValues";

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
  overrideName: null | string;
};

export type FeedGoalProgress = {
  type: "goal_progress";
  userId: number;
  time: number;
  goalId: number;
  subcategoryId: number;
  count: number;
};

export type FeedCurrentSubcategory = {
  type: "current_subcategory";
  userId: number;
  time: number;
  subcategoryId: null | number;
};

export type NewFeedItem =
  | FeedColorMark
  | FeedChat
  | FeedTimerEvent
  | FeedMember
  | FeedGoalProgress
  | FeedCurrentSubcategory;

export type NewFeed = ReadonlyArray<NewFeedItem>;

type FeedFetchPairs = [SQL, (result: SQLResult) => ReadonlyArray<NewFeedItem>];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SQLResult = ReadonlyArray<Record<string, any>>;

export type SQLTemplate = NeonQueryFunction<false, false>;

export type SquareWithId = {
  goalId: number;
  name: string;
};

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
      "user".name,
      member.override_name
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
    name: raw.name,
    overrideName: raw.override_name,
  }));
}

export function fetchGoalProgressSql(sql: SQLTemplate, gameId: number): SQL {
  return sql`
    SELECT
      EXTRACT(EPOCH FROM time)::DOUBLE PRECISION AS unixtime,
      user_id,
      goal_id,
      subcategory_id,
      count
    FROM goal_progress
    WHERE game_id = ${gameId}
  `;
}

export function parseGoalProgressResult(
  result: SQLResult,
): Array<FeedGoalProgress> {
  return result.map((raw) => ({
    type: "goal_progress",
    userId: Number(raw.user_id),
    time: Number(raw.unixtime),
    goalId: Number(raw.goal_id),
    subcategoryId: Number(raw.subcategory_id),
    count: Number(raw.count),
  }));
}

export function fetchCurrentSubcategorySql(
  sql: SQLTemplate,
  gameId: number,
): SQL {
  return sql`
    SELECT
      EXTRACT(EPOCH FROM time)::DOUBLE PRECISION AS unixtime,
      user_id,
      subcategory_id
    FROM current_subcategory
    WHERE game_id = ${gameId}
  `;
}

export function parseCurrentSubcategoryResult(
  result: SQLResult,
): Array<FeedCurrentSubcategory> {
  return result.map((raw) => ({
    type: "current_subcategory",
    userId: Number(raw.user_id),
    time: Number(raw.unixtime),
    subcategoryId: raw.subcategory_id,
  }));
}

function fetchSquaresSql(sql: SQLTemplate, gameId: number): SQL {
  return sql`
    SELECT
      goal_text.id,
      goal_text.name
    FROM game_goal
    INNER JOIN goal_text
    ON game_goal.goal_id = goal_text.id
    WHERE game_goal.game_id = ${gameId}
    ORDER BY game_goal.square_index
  `;
}

function parseSquares(result: SQLResult): ReadonlyArray<SquareWithId> {
  return result.map((raw) => ({ goalId: raw.id, name: raw.name }));
}

function fetchGameSql(sql: SQLTemplate, gameId: number): SQL {
  return sql`
    SELECT
      pasta_id
    FROM game
    WHERE id = ${gameId}
  `;
}

type ParsedGame = {
  pastaId: bigint;
};

function parseGame(result: SQLResult): ParsedGame {
  return { pastaId: BigInt(result[0].pasta_id) };
}

function fetchSubcategoriesSql(sql: SQLTemplate, pasta: UFOPasta): SQL {
  const toFetch = getAllSubcategories(
    pasta.goals,
    getNonGeneralCategories(pasta),
  );
  const subcategoryValues = [];
  for (const sc of toFetch) {
    subcategoryValues.push(sql`${sc}`);
  }
  return sql`
    SELECT
      id,
      name
    FROM subcategory
    WHERE name IN (${joinValues(sql, subcategoryValues)})
  `;
}

export type ParsedSubcategory = {
  subcategoryId: number;
  name: string;
};

function parseSubcategories(
  result: SQLResult,
): ReadonlyArray<ParsedSubcategory> {
  return result.map((raw) => ({ subcategoryId: raw.id, name: raw.name }));
}

export async function fetchData(
  gameId: number,
  memberFeed: ReadonlyArray<FeedMember>,
  isPlay: boolean,
): Promise<{
  squares: ReadonlyArray<SquareWithId>;
  feed: NewFeed;
  pasta: null | UFOPasta;
  subcategories: ReadonlyArray<ParsedSubcategory>;
}> {
  const sql = getSql(false);
  let feedFetchPairs: ReadonlyArray<FeedFetchPairs> = [
    [fetchColorMarkSql(sql, gameId), parseColorMarkResult],
    [fetchChatSql(sql, gameId), parseChatResult],
    [fetchTimerEventSql(sql, gameId), parseTimerEventResult],
  ];
  if (!isPlay) {
    feedFetchPairs = feedFetchPairs.concat([
      [fetchGoalProgressSql(sql, gameId), parseGoalProgressResult],
      [fetchCurrentSubcategorySql(sql, gameId), parseCurrentSubcategoryResult],
    ]);
  }
  const results = await sql.transaction([
    ...feedFetchPairs.map((pair) => pair[0]),
    fetchSquaresSql(sql, gameId),
    fetchGameSql(sql, gameId),
  ]);
  const feedResults = results.slice(0, feedFetchPairs.length);
  const otherResults = results.slice(feedFetchPairs.length);
  const feed = feedResults
    .flatMap((result, index) => feedFetchPairs[index][1](result))
    .concat(memberFeed);
  feed.sort((a, b) => a.time - b.time);

  const squares = parseSquares(otherResults[0]);
  const { pastaId } = parseGame(otherResults[1]);
  const pasta = await fetchPasta(pastaId);
  let subcategories: ReadonlyArray<ParsedSubcategory> = [];
  if (pasta != null && !isPlay) {
    subcategories = parseSubcategories(await fetchSubcategoriesSql(sql, pasta));
  }
  return { squares, feed, pasta, subcategories };
}
