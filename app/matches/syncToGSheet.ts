"use server";

import { google } from "googleapis";
import { Match } from "./Matches";
import getGsheetSyncData from "./getGsheetSyncData";
import getDataSheetId from "./getDataSheetId";
import getExistingRanges from "./getExistingRanges";
import deleteRanges from "./deleteRanges";
import removeFromGsheet from "./removeFromGsheet";

export default async function syncToGSheet(match: Match): Promise<void> {
  const matchLink = `https://ufo50.bingo/match/${match.id}`;
  const auth = new google.auth.JWT({
    email: process.env.GSHEETS_ACCOUNT_EMAIL,
    key: process.env.GSHEETS_ACCOUNT_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheet = google.sheets("v4");

  const data = getGsheetSyncData(match);
  if (data == null) {
    await removeFromGsheet(match.id, match.leagueInfo?.season);
    return;
  }

  const spreadsheetId = getDataSheetId(match.leagueInfo?.season);

  const idRange = match.leagueInfo?.season == null ? "M2:M" : "Q2:Q";
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
  let writeIndex: number | null = null;
  const existingRanges = getExistingRanges(values, matchLink);
  if (
    existingRanges.length === 1 &&
    existingRanges[0][1] - existingRanges[0][0] === 25
  ) {
    writeIndex = existingRanges[0][0] + 1;
  } else {
    // first delete existing rows for this match
    await deleteRanges(existingRanges, spreadsheetId, dataSheetId, auth);
    // find correct place to insert new rows
    const unixtimeResult = await sheet.spreadsheets.values.get({
      spreadsheetId,
      auth,
      range: "Data!R2:R",
    });
    const unixtimeRows = unixtimeResult.data.values ?? [];
    const foundIndex = unixtimeRows.findIndex(
      (existingUnixtime) => existingUnixtime[0] > match.dateCreated,
    );
    writeIndex = foundIndex === -1 ? null : foundIndex + 1;
    if (writeIndex != null) {
      // insert blank rows
      await sheet.spreadsheets.batchUpdate({
        spreadsheetId,
        auth,
        requestBody: {
          requests: [
            {
              insertDimension: {
                range: {
                  sheetId: dataSheetId,
                  dimension: "ROWS",
                  startIndex: writeIndex,
                  endIndex: writeIndex + 25,
                },
                inheritFromBefore: false,
              },
            },
          ],
        },
      });
    }
  }

  if (writeIndex == null) {
    await sheet.spreadsheets.values.append({
      spreadsheetId,
      auth: auth,
      range: "Data",
      valueInputOption: "RAW",
      requestBody: {
        values: data,
      },
    });
  } else {
    await sheet.spreadsheets.values.update({
      spreadsheetId,
      auth,
      // not totally sure why we need to add 1 again...
      range: `Data!A${writeIndex + 1}`,
      valueInputOption: "RAW",
      requestBody: {
        values: data,
      },
    });
  }
}
