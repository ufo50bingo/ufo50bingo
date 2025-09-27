import getSQl from "@/app/getSql";
import { getMatchFromRaw, MATCH_FIELDS } from "@/app/matches/getMatchFromRaw";
import { Match } from "@/app/matches/Matches";
import SingleMatchWrapper from "./SingleMatchWrapper";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await fetchMatch(id);
  if (match == null) {
    return `Failed to find match with ID ${id}`;
  }
  return <SingleMatchWrapper match={match} />;
}

export async function fetchMatch(id: string): Promise<null | Match> {
  const sql = getSQl();
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
