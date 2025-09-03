"use server";

import { revalidatePath } from "next/cache";
import getSql from "../getSql";

export default async function updateVod(
  id: string,
  url: string | null,
  startSeconds: number | null,
  analysisSeconds: number | null
): Promise<void> {
  const sql = getSql(false);

  await sql`UPDATE match
    SET
      vod_url = ${url},
      vod_match_start_seconds = ${startSeconds},
      analysis_seconds = ${analysisSeconds}
    WHERE id = ${id}`;
  revalidatePath("/matches");
}
