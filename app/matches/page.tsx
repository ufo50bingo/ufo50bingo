import Matches, { Match } from "./Matches";
import getSQl from "../getSql";
import { BingosyncColor } from "./refreshMatch";

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
  const result = await sql.query(
    `SELECT
      id,
      name,
      EXTRACT(EPOCH FROM date_created)::INTEGER as date_created,
      p1_name,
      p1_color,
      p1_score,
      p1_bingo,
      p1_win,
      p2_name,
      p2_color,
      p2_score,
      p2_bingo,
      board_json
    FROM match
    WHERE
      is_public = TRUE
      AND is_deleted = FALSE
    ORDER BY date_created DESC
    OFFSET ${(pageNumber - 1) * PAGE_SIZE}
    LIMIT ${PAGE_SIZE}`
  );
  return await result.map((rawMatch) => {
    const p1_name: null | undefined | string = rawMatch.p1_name;
    const p1_score: null | undefined | number = rawMatch.p1_score;
    const p1_color: null | undefined | ReadonlyArray<BingosyncColor> =
      rawMatch.p1_color?.split(" ");

    const p2_name: null | undefined | string = rawMatch.p2_name;
    const p2_score: null | undefined | number = rawMatch.p2_score;
    const p2_color: null | undefined | ReadonlyArray<BingosyncColor> =
      rawMatch.p2_color?.split(" ");

    const p1 =
      p1_name != null &&
      p1_score != null &&
      p1_color != null &&
      p1_color.length > 0
        ? { name: p1_name, score: p1_score, color: p1_color }
        : null;

    const p2 =
      p2_name != null &&
      p2_score != null &&
      p2_color != null &&
      p2_color.length > 0
        ? { name: p2_name, score: p2_score, color: p2_color }
        : null;
    return {
      id: rawMatch.id,
      name: rawMatch.name,
      dateCreated: rawMatch.date_created,
      p1,
      p2,
      hasBingo: null,
      winner: null,
      boardJson: rawMatch.board_json,
    };
  });
}
