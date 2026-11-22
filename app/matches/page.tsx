import getSql from "../getSql";
import { NeonQueryPromise } from "@neondatabase/serverless";
import { Metadata } from "next";
import { MatchList } from "./MatchList";
import { fetchDataMulti, SQLResult, SQLTemplate } from "../fetchFeed";
import {
  MatchFilters,
  MatchFilterSearchParams,
  parseMatchFilters,
} from "./matchFilterParams";

export const metadata: Metadata = {
  title: "UFO 50 Bingo Matches",
  description: "View results for recent matches",
};

const PAGE_SIZE = 20;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SQL = NeonQueryPromise<false, false, Record<string, any>[]>;

export default async function MatchesFetcher(props: {
  searchParams?: Promise<MatchFilterSearchParams>;
}) {
  const sql = getSql();
  const searchParams = await props.searchParams;
  const filters = parseMatchFilters(searchParams);

  const pageNumber = Math.max(1, Math.floor(Number(searchParams?.page)) || 1);
  const result = await fetchFilteredGameIdsSql(sql, filters, pageNumber);
  const { gameIds, totalCount } = parseFilteredGameIdsSql(result);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const games = await fetchDataMulti(sql, gameIds, "spectate");
  return <MatchList totalPages={totalPages} games={games} />;
}

// function getAdminFilterSql(
//   adminFilter: AdminFilter,
//   sql: NeonQueryFunction<false, false>,
// ): SQL {
//   switch (adminFilter) {
//     case "missingTimestamps":
//       return sql`AND vod_url IS NOT NULL AND vod_url != '' AND vod_match_start_seconds IS NULL`;
//     case "leagueMissingVods":
//       return sql`AND league_season IS NOT NULL AND (vod_url IS NULL OR vod_url = '')`;
//   }
// }

function fetchFilteredGameIdsSql(
  sql: SQLTemplate,
  filters: MatchFilters,
  pageNumber: number,
): SQL {
  return sql`
    SELECT
      g.id,
      COUNT(*) OVER () AS total_count
    FROM game g
    LEFT JOIN league_game lg
    ON g.league_game_id = lg.id
    WHERE
      g.is_public = TRUE
      AND g.is_deleted = FALSE
      ${getLeagueFilterSql(sql, filters)}
      ${getMemberFilterSql(sql, filters)}
    ORDER BY g.date_created DESC
    OFFSET ${(pageNumber - 1) * PAGE_SIZE}
    LIMIT ${PAGE_SIZE}
  `;
}

function getLeagueFilterSql(sql: SQLTemplate, filters: MatchFilters): SQL {
  const { season, tiers } = filters;
  const seasonSql =
    season == null
      ? sql``
      : season === 0
        ? sql`AND g.league_game_id IS NULL`
        : sql`AND lg.season = ${season}`;
  const tierSql = tiers.length === 0 ? sql`` : sql`AND lg.tier = ANY(${tiers})`;
  return sql`${seasonSql} ${tierSql}`;
}

// if the latest member/disconnect row is a disconnect, the user is not
// in the match. If it's a member, then they are caster if color is null
// and player otherwise
function getMemberFilterSql(sql: SQLTemplate, filters: MatchFilters): SQL {
  const { playerIds, casterIds } = filters;
  const userIds = [...playerIds, ...casterIds];
  if (userIds.length === 0) {
    return sql``;
  }
  const requiredCount = playerIds.length + casterIds.length;
  return sql`
    AND g.id IN (
      SELECT latest.game_id
      FROM (
        SELECT DISTINCT ON (events.game_id, events.user_id)
          events.game_id,
          events.user_id,
          events.is_member,
          events.is_player
        FROM (
          SELECT
            game_id,
            user_id,
            time,
            TRUE AS is_member,
            player_color IS NOT NULL AS is_player
          FROM member
          WHERE user_id = ANY(${userIds})
          UNION ALL
          SELECT
            game_id,
            user_id,
            time,
            FALSE AS is_member,
            FALSE AS is_player
          FROM disconnect
          WHERE user_id = ANY(${userIds})
        ) events
        ORDER BY events.game_id, events.user_id, events.time DESC
      ) latest
      WHERE
        latest.is_member
        AND (
          (latest.is_player AND latest.user_id = ANY(${playerIds}))
          OR (NOT latest.is_player AND latest.user_id = ANY(${casterIds}))
        )
      GROUP BY latest.game_id
      HAVING COUNT(*) = ${requiredCount}
    )
  `;
}

function parseFilteredGameIdsSql(result: SQLResult): {
  gameIds: ReadonlyArray<number>;
  totalCount: number;
} {
  return {
    gameIds: result.map((row) => row.id),
    totalCount: result.length > 0 ? Number(result[0].total_count) : 0,
  };
}
