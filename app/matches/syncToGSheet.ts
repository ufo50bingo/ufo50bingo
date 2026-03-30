"use server";

import { google } from "googleapis";
import { Changelog, TBoard } from "./parseBingosyncData";
import {
  getChangesWithoutMistakes,
  getColorToVerifiedName,
  getMatchStartTime,
  getSquareCompletionRanges,
} from "./analyzeMatch";
import { Match } from "./Matches";
import { setUrlAtTime } from "./vodUtil";
import getBaseUrlAndHost from "./getBaseUrlAndHost";
import { GAME_NAMES } from "../goals";
import findGoal from "../findGoal";
import { STANDARD_UFO } from "../pastas/standardUfo";

const SEASON_3_SHEET = "12QxCeOhHnmnoRQhiSmD56dPSl3rNnw2mfDt7qScz9Ds";

const DIAGONALS = [0, 6, 18, 24, 4, 8, 16, 20];
const CENTER = 12;

export default async function syncToGSheet(match: Match): Promise<void> {
  const vodURL = match.vod?.url;
  const vodStartSeconds = match.vod?.startSeconds;
  const boardJson = match.boardJson;
  const changelogJson = match.changelogJson;
  // TODO account for seasons
  if (boardJson == null || changelogJson == null) {
    return;
  }
  const board: TBoard = JSON.parse(boardJson);
  const changelog: Changelog = JSON.parse(changelogJson);
  const matchStartTime = getMatchStartTime(changelog, match.analysisSeconds);
  if (matchStartTime == null) {
    return;
  }

  const urlAndHost = getBaseUrlAndHost(vodURL);

  const matchLink = `https://ufo50.bingo/match/${match.id}`;

  const getLink = (time: number) => {
    if (urlAndHost == null || vodStartSeconds == null) {
      return null;
    }
    const url = new URL(urlAndHost[0]);
    setUrlAtTime(urlAndHost[1], url, vodStartSeconds + time - matchStartTime);
    return url.toString();
  };

  const changes = getChangesWithoutMistakes(changelog.changes);
  let colorToVerifiedName = null;
  if (match.leagueInfo != null) {
    colorToVerifiedName = getColorToVerifiedName(
      changelog.changes,
      match.leagueInfo.p1,
      match.leagueInfo.p2,
    );
  }
  const changesWithCorrectedNames =
    colorToVerifiedName != null
      ? changes.map((change) => {
          const correctedName = colorToVerifiedName[change.color];
          return {
            ...change,
            name: correctedName ?? change.name,
          };
        })
      : changes;
  const ranges = getSquareCompletionRanges(
    matchStartTime,
    changesWithCorrectedNames,
  );
  const completionOrder = ranges
    .map((range, squareIndex) => ({ range, squareIndex }))
    .filter(({ range, squareIndex: _squareIndex }) => range != null)
    .toSorted((a, b) => (a.range![2] ?? 0) - (b.range![2] ?? 0))
    .map(({ range: _range, squareIndex }) => squareIndex);
  const rows = ranges
    .map((range, squareIndex) => {
      const goal = board[squareIndex].name;
      const player = range?.[0];
      // For League, first columns are

      // Week
      // Tier
      // Game number
      // Player 1
      // Player 2

      // Shared columns are:

      // Date
      // Completed By
      // Game
      // Goal
      // Source goal
      // Time (mins)
      // Time after match start
      // Completion order
      // Square type
      // Start
      // End
      // Match Link
      const order = completionOrder.indexOf(squareIndex);
      const remainingColumns = [
        new Date(match.dateCreated * 1000).toLocaleDateString("en-US", {
          timeZone: "America/New_York",
        }),
        player,
        getGameForGoal(goal),
        goal,
        findGoal(goal, STANDARD_UFO)?.goal ?? goal,
        range != null ? (range[2] - range[1]) / 60 : null,
        range != null ? (range[2] - matchStartTime) / 60 : null,
        order !== -1 ? order + 1 : null,
        CENTER === squareIndex
          ? "Center"
          : DIAGONALS.includes(squareIndex)
            ? "Diagonal"
            : "Other",
        range != null ? getLink(range[1]) : null,
        range != null ? getLink(range[2]) : null,
        matchLink,
      ];
      return match.leagueInfo?.season != null
        ? [
            match.leagueInfo?.week,
            match.leagueInfo?.tier,
            match.leagueInfo?.game,
            match.leagueInfo?.p1,
            match.leagueInfo?.p2,
            ...remainingColumns,
          ]
        : [match.name, ...remainingColumns];
    })
    .filter((row) => row != null);

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
  const rangesToDelete = getRangesToDelete(values, matchLink);
  if (rangesToDelete.length > 0) {
    await sheet.spreadsheets.batchUpdate({
      spreadsheetId: SEASON_3_SHEET,
      auth,
      requestBody: {
        // need to reverse rangesToDelete because the API will apply all the
        // deletions *in order*. This means that once the first range is deleted,
        // the indexes for all the other ranges will be off
        requests: rangesToDelete.toReversed().map((range) => ({
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

  await sheet.spreadsheets.values.append({
    spreadsheetId: SEASON_3_SHEET,
    auth: auth,
    range: "Data",
    valueInputOption: "RAW",
    requestBody: {
      values: rows,
    },
  });
}

function getRangesToDelete(
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

const GAME_NAMES_STRINGS: { [strippedName: string]: string } = GAME_NAMES;
function getGameForGoal(goal: string): string {
  const beforeColon = goal.split(":")[0];
  const search = beforeColon.toLowerCase().replace(/[^0-9a-z]/gi, "");
  const game = search === "minimax" ? "Mini & Max" : GAME_NAMES_STRINGS[search];
  return game ?? "General";
}
