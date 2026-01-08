import Matches, { AdminFilter, Match } from "./Matches";
import getSql from "../getSql";
import { NeonQueryFunction, NeonQueryPromise } from "@neondatabase/serverless";
import { cacheLife, cacheTag } from "next/cache";
import fetchMatch from "./fetchMatch";
import { Suspense } from "react";

const PAGE_SIZE = 20;

type FilterParams = {
  page?: string;
  season?: string;
  tier?: string;
  week?: string;
  player?: string;
  admin?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SQL = NeonQueryPromise<false, false, Record<string, any>[]>;

export default function Wrapper(props: {
  searchParams?: Promise<FilterParams>;
}) {
  return (
    <Suspense>
      <ParamsFetcher {...props} />
    </Suspense>
  );
}

async function ParamsFetcher(props: { searchParams?: Promise<FilterParams> }) {
  const searchParams = await props.searchParams;
  return <MatchesFetcher searchParams={searchParams} />
}

async function MatchesFetcher(props: { searchParams: FilterParams | undefined }) {
  "use cache";
  cacheLife("max");
  cacheTag("matches");

  const searchParams = await props.searchParams;
  const pageNumber = Number(searchParams?.page ?? "1");
  const [totalPages, matches] = await Promise.all([
    fetchTotalPages(searchParams),
    fetchMatches(pageNumber, searchParams),
  ]);
  return <Matches matches={matches} totalPages={totalPages} />;
}

function getAdminFilterSql(
  adminFilter: AdminFilter,
  sql: NeonQueryFunction<false, false>
): SQL {
  switch (adminFilter) {
    case "missingTimestamps":
      return sql`AND vod_url IS NOT NULL AND vod_url != '' AND vod_match_start_seconds IS NULL`;
    case "leagueMissingVods":
      return sql`AND league_season IS NOT NULL AND (vod_url IS NULL OR vod_url = '')`;
  }
}

function getFilterSql(searchParams: FilterParams | undefined): SQL {
  const sql = getSql();

  const seasonStr = searchParams?.season;
  const season = seasonStr == null ? null : Number(seasonStr);
  const seasonSql =
    season == null
      ? sql``
      : season == 0
        ? sql`AND league_season IS NULL`
        : sql`AND league_season = ${season}`;

  const weekStr = searchParams?.week;
  const weekSql =
    weekStr == null || weekStr === ""
      ? sql``
      : sql`AND league_week = ${weekStr}`;

  const tierStr = searchParams?.tier;
  const tierSql =
    tierStr == null || tierStr === ""
      ? sql``
      : sql`AND league_tier = ${tierStr}`;

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

  const admin = searchParams?.admin;
  const adminSql =
    admin != null
      ? getAdminFilterSql(admin as unknown as AdminFilter, sql)
      : sql``;

  return sql`${seasonSql} ${weekSql} ${tierSql} ${playerSql} ${adminSql}`;
}

async function fetchTotalPages(
  filterParams: FilterParams | undefined
): Promise<number> {
  const filterSql = getFilterSql(filterParams);
  const sql = getSql();
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

async function fetchMatchIDs(
  pageNumber: number,
  filterParams: FilterParams | undefined
): Promise<ReadonlyArray<string>> {
  const filterSql = getFilterSql(filterParams);
  const sql = getSql();
  const result = await sql`
    SELECT
      id
    FROM match
    WHERE
      is_public = TRUE
      AND is_deleted = FALSE
      ${filterSql}
    ORDER BY date_created DESC
    OFFSET ${(pageNumber - 1) * PAGE_SIZE}
    LIMIT ${PAGE_SIZE}`;
  return result.map((row) => row.id);
}

async function fetchMatchesFromIDs(
  ids: ReadonlyArray<string>
): Promise<ReadonlyArray<Match>> {
  const matches = await Promise.all(ids.map(async (id) => fetchMatch(id)));
  return matches.filter((match) => match != null);
}

async function fetchMatches(
  pageNumber: number,
  filterParams: FilterParams | undefined
): Promise<ReadonlyArray<Match>> {
  const ids = await fetchMatchIDs(pageNumber, filterParams);
  return fetchMatchesFromIDs(ids);
}
