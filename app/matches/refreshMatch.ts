"use server";

import { revalidatePath } from "next/cache";
import getSql from "../getSql";
import {
  TBoard,
  Changelog,
  getBoard,
  getChangelog,
} from "./parseBingosyncData";
import syncToGSheet from "./syncToGSheet";
import { getMatchFromRaw, MATCH_FIELDS } from "./getMatchFromRaw";
import { getResult, getResultSql } from "./computeResult";
import { fetchBoard, fetchFeed, getSessionCookie } from "../fetchMatchInfo";

export type PlayerScores = { [name: string]: number };

type ExistingMatch = {
  leagueP1: string | null | undefined;
  leagueP2: string | null | undefined;
  board: TBoard;
  changelog: Changelog;
};
async function fetchExistingMatch(id: string): Promise<ExistingMatch> {
  const sql = getSql();
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

export async function refreshMatch(
  id: string,
  currentBoard: TBoard,
  currentChangelog: Changelog | null,
): Promise<boolean> {
  const cookie = await getSessionCookie(id);
  const [
    boardJson,
    feedJson,
    { leagueP1, leagueP2, board: existingBoard, changelog: existingChangelog },
  ] = await Promise.all([
    fetchBoard(id),
    fetchFeed(id, cookie),
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
    // if current board is not equal, we want to force the client to refresh
    return (
      !areBoardsEqual(currentBoard, board) ||
      currentChangelog == null ||
      !areChangelogsEqual(currentChangelog, changelog)
    );
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
  return false;
}
