"use server";

import { google } from "googleapis";
import { Changelog, TBoard } from "./parseBingosyncData";
import {
  getChangesWithoutMistakes,
  getMatchStartTime,
  getSquareCompletionRanges,
} from "./analyzeMatch";
import { Match } from "./Matches";
import { getVodLink, setUrlAtTime } from "./vodUtil";
import getBaseUrlAndHost from "./getBaseUrlAndHost";
import { GAME_NAMES } from "../goals";

const SHEET_ID = "1bW8zjoR2bpr74w-dA4HHt04SqvGg1aj8FJeOs3EqdNE";
const NON_LEAGUE_NAME = "Non-League";
export default async function syncToGSheet(match: Match): Promise<void> {
  const vodURL = match.vod?.url;
  const vodStartSeconds = match.vod?.startSeconds;
  const boardJson = match.boardJson;
  const changelogJson = match.changelogJson;
  if (
    vodURL == null ||
    vodStartSeconds == null ||
    boardJson == null ||
    changelogJson == null ||
    match.leagueSeason === 1
  ) {
    return;
  }
  const board: TBoard = JSON.parse(boardJson);
  const changelog: Changelog = JSON.parse(changelogJson);
  const matchStartTime = getMatchStartTime(changelog, match.analysisSeconds);
  if (matchStartTime == null) {
    return;
  }

  const urlAndHost = getBaseUrlAndHost(vodURL);
  if (urlAndHost == null) {
    return;
  }
  const getLink = (time: number) => {
    const url = new URL(urlAndHost[0]);
    setUrlAtTime(urlAndHost[1], url, vodStartSeconds + time - matchStartTime);
    return url.toString();
  };

  const changes = getChangesWithoutMistakes(changelog.changes);
  const ranges = getSquareCompletionRanges(matchStartTime, changes);
  const rows = ranges
    .map((range, squareIndex) => {
      if (range == null) {
        return null;
      }
      const goal = board[squareIndex].name;
      const player = range[0];
      const opponent =
        player === match.winner?.name ? match.opponent?.name ?? "" : player;
      // sheet is
      // Room Name,	Date,	Player,	Opponent,	Game,	Goal,	Time (mins),	Start,	End, Match ID
      return [
        match.name,
        new Date(match.dateCreated * 1000).toLocaleDateString("en-US", {
          timeZone: "America/New_York",
        }),
        player,
        opponent,
        getGameForGoal(goal),
        goal,
        ((range[2] - range[1]) / 60).toFixed(1),
        getLink(range[1]),
        getLink(range[2]),
        match.id,
      ];
    })
    .filter((row) => row != null);

  const auth = new google.auth.JWT({
    email: process.env.GSHEETS_ACCOUNT_EMAIL,
    key: process.env.GSHEETS_ACCOUNT_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheet = google.sheets("v4");

  const result = await sheet.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `'${NON_LEAGUE_NAME}'!J2:J`,
    auth,
    fields: "values",
  });
  const metadata = await sheet.spreadsheets.get({
    spreadsheetId: SHEET_ID,
    auth,
  });
  const nonLeagueId = metadata.data.sheets?.find(
    (s) => s.properties?.title === NON_LEAGUE_NAME
  )?.properties?.sheetId;
  const values: ReadonlyArray<ReadonlyArray<string>> = result.data.values ?? [];
  if (nonLeagueId == null) {
    return;
  }
  const rangesToDelete = getRangesToDelete(values, match.id);
  if (rangesToDelete.length > 0) {
    await sheet.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      auth,
      requestBody: {
        // need to reverse rangesToDelete because the API will apply all the
        // deletions *in order*. This means that once the first range is deleted,
        // the indexes for all the other ranges will be off
        requests: rangesToDelete.toReversed().map((range) => ({
          deleteDimension: {
            range: {
              sheetId: nonLeagueId,
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
    spreadsheetId: SHEET_ID,
    auth: auth,
    range: NON_LEAGUE_NAME,
    valueInputOption: "RAW",
    requestBody: {
      values: rows,
    },
  });
}

function getRangesToDelete(
  rows: ReadonlyArray<ReadonlyArray<string>>,
  value: string
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
  const game = GAME_NAMES_STRINGS[search];
  return game ?? "General";
}
