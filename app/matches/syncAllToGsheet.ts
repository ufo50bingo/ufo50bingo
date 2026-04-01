"use server";

import { google } from "googleapis";
import getSql from "../getSql";
import getDataSheetId from "./getDataSheetId";
import getGsheetSyncData from "./getGsheetSyncData";
import { getMatchFromRaw, MATCH_FIELDS } from "./getMatchFromRaw";

export default async function syncAllToGsheet(
  season: null | undefined | number,
): Promise<void> {
  const sql = getSql(false);
  const seasonFilter =
    season == null
      ? sql`league_season IS NULL`
      : sql`league_season = ${season}`;
  const result = await sql`
      SELECT
        ${MATCH_FIELDS}
      FROM match
      WHERE${seasonFilter}`;
  const matches = result.map(r => getMatchFromRaw(r));

  const allRows = matches.map(match => getGsheetSyncData(match)).filter(result => result != null).flat();

  const auth = new google.auth.JWT({
    email: process.env.GSHEETS_ACCOUNT_EMAIL,
    key: process.env.GSHEETS_ACCOUNT_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheet = google.sheets("v4");
  await sheet.spreadsheets.values.append({
    spreadsheetId: getDataSheetId(season),
    auth: auth,
    range: "Data",
    valueInputOption: "RAW",
    requestBody: {
      values: allRows,
    },
  });
}
