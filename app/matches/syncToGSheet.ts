"use server";

import { google } from "googleapis";
import { Match } from "./Matches";
import getGsheetSyncData from "./getGsheetSyncData";

const SEASON_3_SHEET = "12QxCeOhHnmnoRQhiSmD56dPSl3rNnw2mfDt7qScz9Ds";

export default async function syncToGSheet(match: Match): Promise<void> {
  const matchLink = `https://ufo50.bingo/match/${match.id}`;
  const data = getGsheetSyncData(match);
  if (data == null) {
    return;
  }
  // TODO account for seasons
  // TODO handle deleting/new card
  const auth = new google.auth.JWT({
    email: process.env.GSHEETS_ACCOUNT_EMAIL,
    key: process.env.GSHEETS_ACCOUNT_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheet = google.sheets("v4");

  const idRange = match.leagueInfo?.season == null ? "M2:M" : "Q2:Q";
  const result = await sheet.spreadsheets.values.get({
    spreadsheetId: SEASON_3_SHEET,
    range: `Data!${idRange}`,
    auth,
    fields: "values",
  });
  const metadata = await sheet.spreadsheets.get({
    spreadsheetId: SEASON_3_SHEET,
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
    if (existingRanges.length > 0) {
      await sheet.spreadsheets.batchUpdate({
        spreadsheetId: SEASON_3_SHEET,
        auth,
        requestBody: {
          // need to reverse rangesToDelete because the API will apply all the
          // deletions *in order*. This means that once the first range is deleted,
          // the indexes for all the other ranges will be off
          requests: existingRanges.toReversed().map((range) => ({
            deleteDimension: {
              range: {
                sheetId: dataSheetId,
                dimension: "ROWS",
                // first row is the header
                startIndex: range[0] + 1,
                endIndex: range[1] + 1,
              },
            },
          })),
        },
      });
    }
    // find correct place to insert new rows
    const unixtimeResult = await sheet.spreadsheets.values.get({
      spreadsheetId: SEASON_3_SHEET,
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
        spreadsheetId: SEASON_3_SHEET,
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
      spreadsheetId: SEASON_3_SHEET,
      auth: auth,
      range: "Data",
      valueInputOption: "RAW",
      requestBody: {
        values: data,
      },
    });
  } else {
    await sheet.spreadsheets.values.update({
      spreadsheetId: SEASON_3_SHEET,
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

function getExistingRanges(
  rows: ReadonlyArray<ReadonlyArray<string>>,
  value: string,
): ReadonlyArray<[number, number]> {
  const ranges: [number, number][] = [];
  let startIndex: null | number = null;
  rows.forEach((row, index) => {
    if (startIndex == null && row[0] === value) {
      startIndex = index;
    } else if (startIndex != null && row[0] !== value) {
      ranges.push([startIndex, index]);
      startIndex = null;
    }
  });
  if (startIndex != null) {
    ranges.push([startIndex, rows.length]);
  }
  return ranges;
}
