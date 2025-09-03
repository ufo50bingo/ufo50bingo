"use server";

import { revalidatePath } from "next/cache";
import getSql from "../getSql";
import syncToGSheet from "./syncToGSheet";
import { getMatchFromRaw, MATCH_FIELDS } from "./getMatchFromRaw";

export default async function updateVod(
  id: string,
  url: string | null,
  startSeconds: number | null,
  analysisSeconds: number | null
): Promise<void> {
  const sql = getSql(false);

  const result = await sql`UPDATE match
    SET
      vod_url = ${url},
      vod_match_start_seconds = ${startSeconds},
      analysis_seconds = ${analysisSeconds}
    WHERE id = ${id}
    RETURNING ${MATCH_FIELDS}`;
  revalidatePath("/matches");
  // try {
  const rawMatch = result[0];
  const match = getMatchFromRaw(rawMatch);
  await syncToGSheet(match);
  // } catch {}
}
