"use server";

import { revalidatePath } from "next/cache";
import getCsrfData from "../getCsrfData";
import getSql from "../getSql";
import getSQl from "../getSql";
import {
  TBoard,
  Changelog,
  getBoard,
  PlayerToColors,
  RawBoard,
  RawFeed,
  BingosyncColor,
  getChangelog,
  getPlayerColors,
} from "./parseBingosyncData";
import {
  getColorWithLeastRecentClaim,
  getFirstBingoPlayer,
  getIsValid,
  getPlayerWithLeastRecentClaim,
  getVerifiedPlayerToColors,
} from "./analyzeMatch";
import syncToGSheet from "./syncToGSheet";
import { getMatchFromRaw, MATCH_FIELDS } from "./getMatchFromRaw";
import { SQL } from "./page";
import { getResult, getResultSql } from "./computeResult";

export type PlayerScores = { [name: string]: number };

type ExistingMatch = {
  leagueP1: string | null | undefined;
  leagueP2: string | null | undefined;
  board: TBoard;
  changelog: Changelog;
};
async function fetchExistingMatch(id: string): Promise<ExistingMatch> {
  const sql = getSQl();
  const result = await sql`
    SELECT
      league_p1,
      league_p2,
      board_json,
      changelog_json
    FROM match
    WHERE id = ${id}
  `;
  const boardJson = result?.[0]?.board_json;
  const changelogJson = result?.[0]?.changelog_json;
  const board = boardJson != null ? JSON.parse(boardJson) : null;
  const changelog = changelogJson != null ? JSON.parse(changelogJson) : null;
  return {
    leagueP1: result?.[0]?.league_p1,
    leagueP2: result?.[0]?.league_p2,
    board,
    changelog,
  };
}

function areBoardsEqual(a: TBoard, b: TBoard): boolean {
  for (let i = 0; i < 25; i++) {
    const aSquare = a[i];
    const bSquare = b[i];
    if (aSquare.color !== bSquare.color || aSquare.name !== bSquare.name) {
      return false;
    }
  }
  return true;
}

function almostEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.1;
}

function areChangelogsEqual(a: Changelog, b: Changelog): boolean {
  const aRev = a.reveals;
  const bRev = b.reveals;
  if (aRev.length !== bRev.length) {
    return false;
  }
  for (let i = 0; i < aRev.length; i++) {
    if (
      aRev[i].name !== bRev[i].name ||
      !almostEqual(aRev[i].time, bRev[i].time)
    ) {
      return false;
    }
  }

  const aChanges = a.changes;
  const bChanges = b.changes;

  if (aChanges.length !== bChanges.length) {
    return false;
  }
  for (let i = 0; i < aChanges.length; i++) {
    const aChange = aChanges[i];
    const bChange = bChanges[i];
    if (
      aChange.color !== bChange.color ||
      aChange.name !== bChange.name ||
      aChange.index !== bChange.index ||
      !almostEqual(aChange.time, bChange.time)
    ) {
      return false;
    }
  }
  return true;
}

export async function refreshMatch(id: string): Promise<void> {
  const [
    boardJson,
    feedJson,
    { leagueP1, leagueP2, board: existingBoard, changelog: existingChangelog },
  ] = await Promise.all([
    fetchBoard(id),
    fetchFeed(id),
    fetchExistingMatch(id),
  ]);
  const board = getBoard(boardJson);
  const changelog = getChangelog(feedJson);

  if (
    existingBoard != null &&
    existingChangelog != null &&
    areBoardsEqual(existingBoard, board) &&
    areChangelogsEqual(existingChangelog, changelog)
  ) {
    return;
  }

  const result = getResult(board, changelog, leagueP1, leagueP2);
  const isAllBlank = board.every((square) => square.color === "blank");

  const changelogJson = changelog != null ? JSON.stringify(changelog) : null;
  const changes = changelog?.changes;
  const lastColorTime =
    changes != null && changes.length > 0
      ? changes[changes.length - 1].time
      : null;

  const sql = getSql(false);
  const sqlResult = await sql`
    UPDATE match
    SET
      ${getResultSql(result)}
      board_json = ${JSON.stringify(board)},
      changelog_json = ${changelogJson},
      is_board_visible = ${!isAllBlank},
      last_refreshed = CURRENT_TIMESTAMP,
      last_color_time = TO_TIMESTAMP(${lastColorTime})
    WHERE id = ${id}
    RETURNING ${MATCH_FIELDS}`;

  revalidatePath("/matches");
  revalidatePath(`/match/${id}`);
  try {
    const rawMatch = sqlResult[0];
    const match = getMatchFromRaw(rawMatch);
    await syncToGSheet(match);
  } catch {}
}

async function fetchBoard(id: string): Promise<RawBoard> {
  const boardResult = await fetch(
    `https://www.bingosync.com/room/${id}/board`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return await boardResult.json();
}

async function fetchFeed(id: string): Promise<RawFeed> {
  const roomURL = `https://www.bingosync.com/room/${id}`;

  const sql = getSQl();
  const [{ cookie, token }, sqlResult] = await Promise.all([
    getCsrfData(),
    sql`SELECT name, password FROM match WHERE id = ${id}`,
  ]);
  const name: null | void | string = sqlResult?.[0]?.name;
  const password: null | void | string = sqlResult?.[0]?.password;

  if (password == null || name == null) {
    throw new Error(`No name or password found for match ${id}`);
  }

  const roomResponse = await fetch(roomURL, {
    method: "POST",
    redirect: "manual",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookie,
    },
    body: new URLSearchParams({
      csrfmiddlewaretoken: token,
      encoded_room_uuid: id,
      room_name: name,
      creator_name: "ufo50bingobot",
      game_name: "Custom (Advanced) - SRL v5",
      player_name: "ufo50bingobot",
      passphrase: password,
      is_spectator: "on",
    }).toString(),
  });

  const sessionCookie = roomResponse.headers.get("Set-Cookie");
  if (sessionCookie == null) {
    throw new Error(`Failed to fetch session cookie for id ${id}`);
  }

  const url = new URL(`${roomURL}/feed`);
  url.search = new URLSearchParams({
    full: "true",
  }).toString();

  const feedResponse = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Cookie: `${cookie}; ${sessionCookie}`,
    },
  });
  const feedJson: RawFeed = await feedResponse.json();
  return feedJson;
}
