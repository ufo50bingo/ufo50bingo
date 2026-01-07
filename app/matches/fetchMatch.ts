import { cacheLife, cacheTag } from "next/cache";
import getSql from "../getSql";
import { MATCH_FIELDS, getMatchFromRaw } from "./getMatchFromRaw";
import { Match } from "./Matches";

export default async function fetchMatch(id: string): Promise<null | Match> {
  "use cache";
  cacheLife("max");
  cacheTag(`match-${id}`);
  const sql = getSql();
  const result = await sql`
    SELECT
      ${MATCH_FIELDS}
    FROM match
    WHERE
      id = ${id}`;
  if (result.length === 0) {
    return null;
  }
  return getMatchFromRaw(result[0]);
}
