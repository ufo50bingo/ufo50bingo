import getSQl from "../getSql";
import { refreshMatch } from "../matches/refreshMatch";

// https://github.com/kbuzsaki/bingosync/issues/401#issuecomment-2972818382
// https://github.com/kbuzsaki/bingosync/issues/233
// curl -X POST http://localhost:3000/refreshapi
export async function POST(_request: Request) {
  console.log("starting to sleep");
  await sleep(120000);
  console.log("done sleeping");
  // try {
  //   const sql = getSQl(false);
  //   const recentMatches = await sql`
  //     SELECT id, board_json, changelog_json
  //     FROM match
  //     WHERE date_created > current_timestamp - interval '16 hours'
  //       AND is_public = TRUE
  //       AND is_deleted = FALSE
  //       AND (
  //         last_color_time IS NULL OR
  //         last_refreshed - last_color_time < interval '3 hours'
  //       )
  //     ORDER BY date_created DESC
  //     LIMIT 3;
  //   `;
  //   const ids = recentMatches.map((match) => match.id);
  //   for (const id of ids) {
  //     await refreshMatch(id);
  //     await sleep(15000);
  //   }
  return new Response(null, { status: 204 });
  // } catch (err) {
  //   console.error(err);
  //   return new Response(null, { status: 500 });
  // }
}

function sleep(durationMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}
