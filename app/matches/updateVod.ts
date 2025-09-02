"use server";

import { revalidatePath } from "next/cache";
import getSql from "../getSql";
import { google } from "googleapis";

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

const SHEET_ID = "1bW8zjoR2bpr74w-dA4HHt04SqvGg1aj8FJeOs3EqdNE";
async function updateSheet(): Promise<void> {
  const auth = new google.auth.JWT({
    email: process.env.GSHEETS_ACCOUNT_EMAIL,
    key: process.env.GSHEETS_ACCOUNT_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheet = google.sheets("v4");
  await sheet.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    auth: auth,
    range: "[WIP] Season 2",
    valueInputOption: "RAW",
    requestBody: {
      values: [["hello", "world"]],
    },
  });
}
