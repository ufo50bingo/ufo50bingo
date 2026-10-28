import PlayWrapper from "./PlayWrapper";
import getSql from "@/app/getSql";
import { SQL } from "@/app/matches/page";
import getUserId from "@/app/getUserId";
import {
  NewFeed,
  FeedFetchPairs,
  fetchColorMarkSql,
  parseColorMarkResult,
  fetchChatSql,
  parseChatResult,
  fetchTimerEventSql,
  parseTimerEventResult,
  SQLResult,
  SQLTemplate,
  FeedMember,
} from "@/app/fetchFeed";

type Props = {
  userId: number;
  gameId: number;
  memberFeed: ReadonlyArray<FeedMember>;
};

export default async function PlayPage({ gameId }: Props) {
  const [userId, data] = await Promise.all([
    getUserId(),
    fetchData(Number(gameId)),
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
    fetchSquareNamesSql(sql, gameId),
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

export function fetchSquareNamesSql(sql: SQLTemplate, gameId: number): SQL {
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

export function parseSquareNames(result: SQLResult): ReadonlyArray<string> {
  return result.map((raw) => raw.name);
}
