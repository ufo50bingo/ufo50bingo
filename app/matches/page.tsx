import Matches, { Match } from "./Matches";
import getSQl from "../getSql";
import { getMatchFromRaw, MATCH_FIELDS } from "./getMatchFromRaw";
import { NeonQueryPromise } from "@neondatabase/serverless";

const PAGE_SIZE = 20;

type SQL = NeonQueryPromise<false, false, Record<string, any>[]>;

export default async function MatchesFetcher(props: {
  searchParams?: Promise<{
    page?: string;
    player?: string;
    season?: string;
  }>;
}) {
  const sql = getSQl();
  const searchParams = await props.searchParams;
  const seasonStr = searchParams?.season;
  const season = seasonStr == null ? null : Number(seasonStr);
  const seasonSql =
    season == null
      ? sql``
      : season == 0
      ? sql`AND league_season IS NULL`
      : sql`AND league_season = ${season}`;
  const playerStr = searchParams?.player;
  const player = playerStr == null ? null : playerStr.toLowerCase();
  const playerSql =
    player != null && player !== ""
      ? sql`
    AND (
      LOWER(winner_name) = LOWER(${player})
      OR LOWER(opponent_name) = LOWER(${player})
      OR LOWER(league_p1) = LOWER(${player})
      OR LOWER(league_p2) = LOWER(${player})
    )`
      : sql``;

  const filterSql = sql`${seasonSql} ${playerSql}`;

  const pageNumber = Number(searchParams?.page ?? "1");
  const [totalPages, matches] = await Promise.all([
    fetchTotalPages(filterSql),
    fetchMatches(pageNumber, filterSql),
  ]);
  return <Matches matches={matches} totalPages={totalPages} />;
}

async function fetchTotalPages(filterSql: SQL): Promise<number> {
  const sql = getSQl();
  const result = await sql`
    SELECT COUNT(id) as total_matches
    FROM match
    WHERE
      is_public = TRUE
      AND is_deleted = FALSE
      ${filterSql};`;
  const totalMatches: number = result[0].total_matches;
  return Math.ceil(totalMatches / PAGE_SIZE);
}

async function fetchMatches(
  pageNumber: number,
  filterSql: SQL
): Promise<ReadonlyArray<Match>> {
  const sql = getSQl();
  const result = await sql`
    SELECT
      ${MATCH_FIELDS}
    FROM match
    WHERE
      is_public = TRUE
      AND is_deleted = FALSE
      ${filterSql}
    ORDER BY date_created DESC
    OFFSET ${(pageNumber - 1) * PAGE_SIZE}
    LIMIT ${PAGE_SIZE}`;
  return result.map(getMatchFromRaw);
}
