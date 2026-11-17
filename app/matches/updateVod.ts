"use server";

import { revalidatePath } from "next/cache";
import getSql from "../getSql";

export default async function updateVod(
  gameId: number,
  url: string,
  startSeconds: number | null,
): Promise<void> {
  const trimmedUrl = url.trim();
  const vodUrl = trimmedUrl === "" ? null : trimmedUrl;
  const vodStartSeconds = vodUrl == null ? null : startSeconds;

  const sql = getSql(false);
  const result = await sql`
    UPDATE game
    SET
      vod_url = ${vodUrl},
      vod_match_start_seconds = ${vodStartSeconds}
    WHERE id = ${gameId}
    RETURNING id`;
  if (result.length === 0) {
    throw new Error(`Match ${gameId} not found`);
  }

  revalidatePath("/matches");
  revalidatePath(`/match/${gameId}`);

  // await Promise.all([syncToGSheet(match), syncVodToLeagueSheet(match)]);
}
