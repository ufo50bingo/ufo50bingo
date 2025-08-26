import Matches, { Match } from "./Matches";
import getSQl from "../getSql";

export default async function MatchesFetcher() {
  const sql = getSQl();
  const result = await sql`
    SELECT
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
    ORDER BY date_created DESC`;
  const matches: ReadonlyArray<Match> = result.map((rawMatch) => ({
    id: rawMatch.id,
    name: rawMatch.name,
    dateCreated: rawMatch.date_created,
    p1: {
      name: "Frank",
      score: 13,
      color: "red",
    },
    p2: {
      name: "Smo",
      score: 11,
      color: "blue",
    },
    hasBingo: false,
    winner: "p1",
  }));
  return <Matches matches={matches} />;
}
