"use server";

import { google } from "googleapis";
import { LEAGUE_SHEET_ID } from "../schedule/fetchSchedule";

// TODO: Fix this
export default async function syncVodToLeagueSheet(
  game: unknown,
): Promise<void> {
  // if (
  //   match.leagueInfo == null ||
  //   match.leagueInfo.season < 3 ||
  //   match.vod?.url == null
  // ) {
  //   return;
  // }

  const auth = new google.auth.JWT({
    email: process.env.GSHEETS_ACCOUNT_EMAIL,
    key: process.env.GSHEETS_ACCOUNT_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheet = google.sheets({ version: "v4" });
  await sheet.spreadsheets.values.append({
    spreadsheetId: LEAGUE_SHEET_ID,
    auth: auth,
    range: "Matches with VODs",
    valueInputOption: "RAW",
    requestBody: {
      // todo: do we need to make sure that substrings don't mess this up?
      // values: [[match.id]],
      values: [[]],
    },
  });
}
