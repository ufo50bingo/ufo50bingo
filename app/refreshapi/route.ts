import getSQl from "../getSql";
import { refreshMatch } from "../matches/refreshMatch";

export async function POST(_request: Request) {
  try {
    const sql = getSQl(false);
    const recentMatches = await sql`
      SELECT id
      FROM match
      WHERE date_created > current_timestamp - interval '16 hours'
        AND is_public = TRUE
        AND is_deleted = FALSE
        AND (
          last_color_time IS NULL OR
          last_refreshed IS NULL OR
          last_refreshed - last_color_time < interval '3 hours'
        )
      ORDER BY date_created ASC
      LIMIT 3;
    `;
    const matchIds = recentMatches.map((match) => match.id);
    await Promise.all(matchIds.map((id) => refreshMatch(id)));
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 500 });
  }
}
