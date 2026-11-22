import { LEAGUE_TIER, parseTier } from "./tier";

export const NON_LEAGUE_SEASON = "0";

export type MatchFilterSearchParams = {
  page?: string;
  season?: string;
  tiers?: string;
  players?: string;
  casters?: string;
};

export type MatchFilters = {
  // null means any season, 0 means non-league matches only
  season: null | number;
  tiers: ReadonlyArray<LEAGUE_TIER>;
  playerIds: ReadonlyArray<number>;
  casterIds: ReadonlyArray<number>;
};

export function parseUserIds(
  raw: string | null | undefined,
): ReadonlyArray<number> {
  if (raw == null || raw === "") {
    return [];
  }
  const ids = raw
    .split(",")
    .map((idStr) => Number(idStr))
    .filter((id) => Number.isInteger(id));
  return [...new Set(ids)];
}

function parseSeason(raw: string | undefined): null | number {
  if (raw == null || raw === "") {
    return null;
  }
  const season = Number(raw);
  return Number.isInteger(season) && season >= 0 ? season : null;
}

function parseTiers(raw: string | undefined): ReadonlyArray<LEAGUE_TIER> {
  if (raw == null || raw === "") {
    return [];
  }
  const tiers = raw
    .split(",")
    .map((tierStr) => parseTier(tierStr))
    .filter((tier) => tier != null);
  return [...new Set(tiers)];
}

export function parseMatchFilters(
  searchParams: MatchFilterSearchParams | undefined,
): MatchFilters {
  return {
    season: parseSeason(searchParams?.season),
    tiers: parseTiers(searchParams?.tiers),
    playerIds: parseUserIds(searchParams?.players),
    casterIds: parseUserIds(searchParams?.casters),
  };
}
