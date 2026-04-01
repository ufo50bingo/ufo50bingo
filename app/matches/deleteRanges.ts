import { google } from "googleapis";
import { JWT } from "google-auth-library";

export default async function deleteRanges(
  ranges: readonly [number, number][],
  spreadsheetId: string,
  dataSheetId: number,
  auth: JWT,
): Promise<void> {
  if (ranges.length > 0) {
    await google.sheets("v4").spreadsheets.batchUpdate({
      spreadsheetId,
      auth,
      requestBody: {
        // need to reverse rangesToDelete because the API will apply all the
        // deletions *in order*. This means that once the first range is deleted,
        // the indexes for all the other ranges will be off
        requests: ranges.toReversed().map((range) => ({
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
}
