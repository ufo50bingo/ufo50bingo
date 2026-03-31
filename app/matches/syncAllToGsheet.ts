"use server";

import getSql from "../getSql";
import { getMatchFromRaw, MATCH_FIELDS } from "./getMatchFromRaw";

export default async function syncAllToGsheet(
  season: null | undefined | number,
): Promise<void> {
  const sql = getSql(false);
  const seasonFilter =
    season == null
      ? sql`league_season IS NULL`
      : sql`league_season = ${season}`;
  const result = await sql`
      SELECT
        ${MATCH_FIELDS}
      FROM match
      WHERE${seasonFilter}`;
  return getMatchFromRaw(result[0]);
}
