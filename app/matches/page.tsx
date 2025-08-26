import Matches, { Match } from "./Matches";
import getSQl from "../getSql";
import { BingosyncColor } from "./refreshMatch";

export default async function MatchesFetcher() {
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
      p2_bingo
    FROM match
    WHERE is_public = TRUE
    ORDER BY date_created DESC`
  );
  const matches: ReadonlyArray<Match> = result.map((rawMatch) => {
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
    };
  });
  return <Matches matches={matches} />;
}
