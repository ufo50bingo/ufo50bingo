import { google } from "googleapis";
import { Match } from "./Matches";

const SHEET_ID = "1bW8zjoR2bpr74w-dA4HHt04SqvGg1aj8FJeOs3EqdNE";
async function syncToGsheet(match: Match): Promise<void> {
  const auth = new google.auth.JWT({
    email: process.env.GSHEETS_ACCOUNT_EMAIL,
    key: process.env.GSHEETS_ACCOUNT_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheet = google.sheets("v4");
  await sheet.spreadsheets.values.batchUpdateByDataFilter;
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
