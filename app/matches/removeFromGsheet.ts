"use server";

import { google } from "googleapis";
import getDataSheetId from "./getDataSheetId";
import getExistingRanges from "./getExistingRanges";
import deleteRanges from "./deleteRanges";

export default async function removeFromGsheet(
  id: string,
  season: null | undefined | number,
): Promise<void> {
  const auth = new google.auth.JWT({
    email: process.env.GSHEETS_ACCOUNT_EMAIL,
    key: process.env.GSHEETS_ACCOUNT_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheet = google.sheets("v4");
  const spreadsheetId = getDataSheetId(season);

  const idRange = season == null ? "M2:M" : "Q2:Q";
  const result = await sheet.spreadsheets.values.get({
    spreadsheetId,
    range: `Data!${idRange}`,
    auth,
    fields: "values",
  });
  const metadata = await sheet.spreadsheets.get({
    spreadsheetId,
    auth,
  });
  const dataSheetId = metadata.data.sheets?.find(
    (s) => s.properties?.title === "Data",
  )?.properties?.sheetId;
  const values: ReadonlyArray<ReadonlyArray<string>> = result.data.values ?? [];
  if (dataSheetId == null) {
    return;
  }
  const existingRanges = getExistingRanges(
    values,
    `https://ufo50.bingo/match/${id}`,
  );
  await deleteRanges(existingRanges, spreadsheetId, dataSheetId, auth);
}
