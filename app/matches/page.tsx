import Matches, { Match } from "./Matches";
import getSQl from "../getSql";
import { getMatchFromRaw, MATCH_FIELDS } from "./getMatchFromRaw";

const PAGE_SIZE = 20;

export default async function MatchesFetcher(props: {
  searchParams?: Promise<{
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const pageNumber = Number(searchParams?.page ?? "1");
  const [totalPages, matches] = await Promise.all([
    fetchTotalPages(),
    fetchMatches(pageNumber),
  ]);
  return <Matches matches={matches} totalPages={totalPages} />;
}

async function fetchTotalPages(): Promise<number> {
  const sql = getSQl();
  const result = await sql.query(
    `SELECT COUNT(id) as total_matches
    FROM match
    WHERE
      is_public = TRUE
      AND is_deleted = FALSE`
  );
  const totalMatches: number = result[0].total_matches;
  return Math.ceil(totalMatches / PAGE_SIZE);
}

async function fetchMatches(pageNumber: number): Promise<ReadonlyArray<Match>> {
  const sql = getSQl();
  const result = await sql`
    SELECT
      ${MATCH_FIELDS}
    FROM match
    WHERE
      is_public = TRUE
      AND is_deleted = FALSE
    ORDER BY date_created DESC
    OFFSET ${(pageNumber - 1) * PAGE_SIZE}
    LIMIT ${PAGE_SIZE}`;
  return result.map(getMatchFromRaw);
}
