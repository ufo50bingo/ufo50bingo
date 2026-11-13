import { NeonQueryFunction } from "@neondatabase/serverless";
import { SQL } from "./matches/page";
import { SyncedTimerEventName } from "./room/[id]/common/useSyncedTimer";
import { fetchPastas } from "./pastaStorage";
import { UFOPasta } from "./generator/ufoGenerator";
import getAllSubcategories from "./createboard/getAllSubcategories";
import getNonGeneralCategories from "./createboard/getNonGeneralCategories";
import joinValues from "./joinValues";
import { getMatchingRepoPasta } from "./getMatchingRepoPasta";
import getAllCastOptions from "./createboard/getAllCastOptions";
import getGameList from "./room/[id]/common/getGameList";
import { LEAGUE_TIER } from "./matches/tier";
import { WEEK } from "./matches/week";
import { BingosyncColor } from "./color";

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
  image: null | string;
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

export type FeedPlayerOrder = {
  type: "player_order";
  time: number;
  orderedIds: ReadonlyArray<number>;
};

export type FeedPlayerColorChange = {
  type: "player_color_change";
  time: number;
  userId: number;
  playerColor: BingosyncColor;
};

export type FeedDisconnect = {
  type: "disconnect";
  time: number;
  userId: number;
};

export type NewFeedItem =
  | FeedColorMark
  | FeedChat
  | FeedTimerEvent
  | FeedMember
  | FeedGoalProgress
  | FeedCurrentSubcategory
  | FeedPlayerOrder
  | FeedPlayerColorChange
  | FeedDisconnect;

export type NewFeed = ReadonlyArray<NewFeedItem>;

type FeedParsePair = [
  (sql: SQLTemplate, gameId: number) => SQL,
  (result: SQLResult) => ReadonlyArray<NewFeedItem>,
];

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
      member.override_name,
      "user".name,
      "user".image
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
    image: raw.image,
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

export function fetchPlayerOrderSql(sql: SQLTemplate, gameId: number): SQL {
  return sql`
    SELECT
      EXTRACT(EPOCH FROM time)::DOUBLE PRECISION AS unixtime,
      ordered_ids
    FROM player_order
    WHERE game_id = ${gameId}
  `;
}

export function parsePlayerOrderResult(
  result: SQLResult,
): Array<FeedPlayerOrder> {
  return result.map((raw) => ({
    type: "player_order",
    time: Number(raw.unixtime),
    orderedIds: raw.ordered_ids,
  }));
}

export function fetchPlayerColorChangeSql(
  sql: SQLTemplate,
  gameId: number,
): SQL {
  return sql`
    SELECT
      EXTRACT(EPOCH FROM time)::DOUBLE PRECISION AS unixtime,
      user_id,
      player_color
    FROM player_color_change
    WHERE game_id = ${gameId}
  `;
}

export function parsePlayerColorChangeResult(
  result: SQLResult,
): Array<FeedPlayerColorChange> {
  return result.map((raw) => ({
    type: "player_color_change",
    time: Number(raw.unixtime),
    userId: raw.user_id,
    playerColor: raw.player_color,
  }));
}

export function fetchDisconnectSql(sql: SQLTemplate, gameId: number): SQL {
  return sql`
    SELECT
      EXTRACT(EPOCH FROM time)::DOUBLE PRECISION AS unixtime,
      user_id
    FROM disconnect
    WHERE game_id = ${gameId}
  `;
}

export function parseDisconnectResult(
  result: SQLResult,
): Array<FeedDisconnect> {
  return result.map((raw) => ({
    type: "disconnect",
    time: Number(raw.unixtime),
    userId: raw.user_id,
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

function parseSquaresResult(result: SQLResult): ReadonlyArray<SquareWithId> {
  return result.map((raw) => ({ goalId: raw.id, name: raw.name }));
}

function fetchGameSql(sql: SQLTemplate, gameId: number): SQL {
  return sql`
    SELECT
      g.id,
      g.name,
      EXTRACT(EPOCH FROM g.date_created)::DOUBLE PRECISION AS unixtime,
      g.creator_id,
      g.variant,
      g.is_lockout,
      g.rows,
      g.cols,
      g.vod_url,
      g.vod_match_start_seconds,
      g.is_custom,
      g.is_draft,
      g.pasta_id,
      lg.id AS league_game_id,
      lg.p1_id,
      lg.p2_id,
      lg.season,
      lg.week,
      lg.tier,
      lg.game_number
    FROM game g
    LEFT JOIN league_game lg
    ON g.league_game_id = lg.id
    WHERE g.id = ${gameId}
  `;
}

function parseGameResult(result: SQLResult): ParsedGame {
  const row = result[0];
  const pastaIdRaw = row.pasta_id;
  const pastaId = pastaIdRaw == null ? null : BigInt(pastaIdRaw);
  const leagueGameId = row.league_game_id;
  const leagueGame: null | LeagueGame =
    leagueGameId != null
      ? {
          id: leagueGameId,
          p1Id: row.p1Id,
          p2Id: row.p2Id,
          season: row.season,
          week: row.week,
          tier: row.tier,
          gameNumber: row.gameNumber,
        }
      : null;
  const vodUrl = row.vod_url;
  const vod: Vod | null =
    vodUrl != null
      ? { url: vodUrl, startSeconds: row.vod_match_start_seconds }
      : null;
  return {
    id: row.id,
    rows: row.rows,
    cols: row.cols,
    name: row.name,
    variant: row.variant,
    dateCreated: row.unixtime,
    creatorId: row.creator_id,
    isLockout: row.is_lockout,
    isCustom: row.is_custom,
    isDraft: row.is_draft,
    leagueGame,
    vod,
    pastaId,
  };
}

function getAllSubcategoriesToLoad(pasta: null | UFOPasta): Set<string> {
  let toFetch = new Set(Object.keys(getGameList(pasta)));
  if (pasta != null) {
    toFetch = toFetch
      .union(getAllSubcategories(pasta.goals, getNonGeneralCategories(pasta)))
      .union(getAllCastOptions(pasta));
  }
  return toFetch;
}

function fetchSubcategoriesSql(
  sql: SQLTemplate,
  allSubcategories: Set<string>,
): SQL {
  const subcategoryValues = [];
  for (const sc of allSubcategories) {
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

type FetchDataView = "cast" | "play" | "spectate";

export async function fetchData(
  sql: SQLTemplate,
  gameId: number,
  view: FetchDataView,
): Promise<FullParsedGame> {
  return (await fetchDataMulti(sql, [gameId], view))[0];
}

export type Vod = {
  url: string;
  startSeconds: null | number;
};

export type LeagueGame = {
  id: number;
  p1Id: number;
  p2Id: number;
  season: number;
  week: WEEK;
  tier: LEAGUE_TIER;
  gameNumber: number;
};

export type ParsedGame = {
  id: number;
  rows: number;
  cols: number;
  name: null | string;
  variant: string;
  dateCreated: number;
  creatorId: number;
  isCustom: boolean;
  isDraft: boolean;
  isLockout: boolean;
  leagueGame: null | LeagueGame;
  vod: null | Vod;
  pastaId: null | bigint;
};

export interface FullParsedGame extends PartialParsedGame {
  fetchedPasta: null | UFOPasta;
  subcategories: ReadonlyArray<ParsedSubcategory>;
}

interface PartialParsedGame {
  game: ParsedGame;
  squares: ReadonlyArray<SquareWithId>;
  feed: NewFeed;
}

export async function fetchDataMulti(
  sql: SQLTemplate,
  gameIds: ReadonlyArray<number>,
  view: FetchDataView,
): Promise<ReadonlyArray<FullParsedGame>> {
  let feedFetchPairs: ReadonlyArray<FeedParsePair> = [
    [fetchColorMarkSql, parseColorMarkResult],
    [fetchChatSql, parseChatResult],
    [fetchTimerEventSql, parseTimerEventResult],
    [fetchPlayerColorChangeSql, parsePlayerColorChangeResult],
  ];
  if (view !== "play") {
    feedFetchPairs = feedFetchPairs.concat([
      [fetchGoalProgressSql, parseGoalProgressResult],
      [fetchCurrentSubcategorySql, parseCurrentSubcategoryResult],
      [fetchPlayerOrderSql, parsePlayerOrderResult],
    ]);
  }
  if (view === "spectate") {
    feedFetchPairs = feedFetchPairs.concat([
      [fetchMemberSql, parseMemberResult],
      [fetchDisconnectSql, parseDisconnectResult],
    ]);
  }
  const allFeedFetches = gameIds.flatMap((gameId) =>
    feedFetchPairs.map((pair) => pair[0](sql, gameId)),
  );
  const allOtherFetches = gameIds.flatMap((gameId) => [
    fetchSquaresSql(sql, gameId),
    fetchGameSql(sql, gameId),
  ]);

  const results = await sql.transaction(allFeedFetches.concat(allOtherFetches));

  const numFeedFetches = feedFetchPairs.length;
  const feedResultsPartitioned = gameIds.map((_, idx) =>
    results.slice(idx * numFeedFetches, (idx + 1) * numFeedFetches),
  );
  const allOtherResults = results.slice(numFeedFetches * gameIds.length);
  const otherResultsPartitioned = gameIds.map((_, idx) =>
    allOtherResults.slice(2 * idx, 2 * (idx + 1)),
  );

  const parsed: ReadonlyArray<PartialParsedGame> = gameIds.map(
    (gameId, idx) => {
      const feedResults = feedResultsPartitioned[idx];
      const otherResults = otherResultsPartitioned[idx];
      const feed = feedResults.flatMap((result, index) =>
        feedFetchPairs[index][1](result),
      );
      feed.sort((a, b) => a.time - b.time);

      const squares = parseSquaresResult(otherResults[0]);
      const game = parseGameResult(otherResults[1]);
      return { game, feed, squares };
    },
  );

  const uniquePastaIds = new Set(
    parsed.map((p) => p.game.pastaId).filter((pastaId) => pastaId != null),
  );
  const pastaIdToPasta: Map<bigint, UFOPasta | null> = new Map(
    [...uniquePastaIds].map((pastaId) => {
      return [pastaId, getMatchingRepoPasta(pastaId)];
    }),
  );
  const missingPastaIds = [
    ...pastaIdToPasta
      .entries()
      .filter(([_, pasta]) => pasta == null)
      .map(([pastaId, _]) => pastaId),
  ];
  const fetchedPastas = await fetchPastas(missingPastaIds);
  for (const [pastaId, fetchedPasta] of fetchedPastas) {
    pastaIdToPasta.set(pastaId, fetchedPasta);
  }

  const pastaIdToParsedSubcategories: Map<
    bigint,
    ReadonlyArray<ParsedSubcategory>
  > = new Map();
  let nullPastaSubcategories: ReadonlyArray<ParsedSubcategory> = [];

  if (view !== "play") {
    const pastaIdToSubcategoryNames: Map<bigint, Set<string>> = new Map(
      pastaIdToPasta
        .entries()
        .map(([pastaId, pasta]) => [pastaId, getAllSubcategoriesToLoad(pasta)]),
    );

    const nullPastaNames: null | Set<string> = parsed.some(
      (p) => p.game.pastaId == null,
    )
      ? getAllSubcategoriesToLoad(null)
      : null;

    const allToLoad: Set<string> = new Set(nullPastaNames ?? []);
    for (const names of pastaIdToSubcategoryNames.values()) {
      for (const name of names) {
        allToLoad.add(name);
      }
    }

    let parsedSubcategories: ReadonlyArray<ParsedSubcategory> = [];
    if (allToLoad.size > 0) {
      parsedSubcategories = parseSubcategories(
        await fetchSubcategoriesSql(sql, allToLoad),
      );
    }
    const scNameToParsed = new Map(parsedSubcategories.map((p) => [p.name, p]));
    const getParsedFromNames = (names: Set<string>) =>
      [...names]
        .map((name) => scNameToParsed.get(name))
        .filter((p) => p != null);

    for (const [pastaId, scNames] of pastaIdToSubcategoryNames) {
      pastaIdToParsedSubcategories.set(pastaId, getParsedFromNames(scNames));
    }
    if (nullPastaNames != null) {
      nullPastaSubcategories = getParsedFromNames(nullPastaNames);
    }
  }

  return parsed.map((p) => ({
    ...p,
    fetchedPasta:
      p.game.pastaId != null
        ? (fetchedPastas.get(p.game.pastaId) ?? null)
        : null,
    subcategories:
      p.game.pastaId != null
        ? (pastaIdToParsedSubcategories.get(p.game.pastaId) ?? [])
        : nullPastaSubcategories,
  }));
}
