import Matches, { Match } from "./Matches";
import getSQl from "../getSql";
import { BingosyncColor } from "./parseBingosyncData";

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
      variant,
      is_custom,
      winner_name,
      winner_color,
      winner_score,
      winner_bingo,
      opponent_name,
      opponent_color,
      opponent_score,
      board_json,
      changelog_json
    FROM match
    WHERE
      is_public = TRUE
      AND is_deleted = FALSE
    ORDER BY date_created DESC
    OFFSET ${(pageNumber - 1) * PAGE_SIZE}
    LIMIT ${PAGE_SIZE}`
  );
  return result.map((rawMatch) => {
    const winner_name: null | undefined | string = rawMatch.winner_name;
    const winner_score: null | undefined | number = rawMatch.winner_score;
    const winner_color: null | undefined | BingosyncColor =
      rawMatch.winner_color;

    const opponent_name: null | undefined | string = rawMatch.opponent_name;
    const opponent_score: null | undefined | number = rawMatch.opponent_score;
    const opponent_color: null | undefined | BingosyncColor =
      rawMatch.opponent_color;

    const winner =
      winner_name != null &&
      winner_score != null &&
      winner_color != null &&
      winner_color.length > 0
        ? { name: winner_name, score: winner_score, color: winner_color }
        : null;

    const opponent =
      opponent_name != null &&
      opponent_score != null &&
      opponent_color != null &&
      opponent_color.length > 0
        ? { name: opponent_name, score: opponent_score, color: opponent_color }
        : null;
    return {
      id: rawMatch.id,
      name: rawMatch.name,
      dateCreated: rawMatch.date_created,
      variant: rawMatch.variant,
      isCustom: rawMatch.is_custom,
      winner,
      opponent,
      hasBingo: rawMatch.winner_bingo === true,
      boardJson: rawMatch.board_json,
      changelogJson: rawMatch.changelog_json,
    };
  });
}
