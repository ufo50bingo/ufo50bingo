"use server";

import { revalidatePath } from "next/cache";
import syncToGSheet from "./syncToGSheet";
import { getMatchFromRaw, MATCH_FIELDS } from "./getMatchFromRaw";
import { LeagueInfo } from "../createboard/createMatch";
import { SQL } from "./page";
import getSql from "../getSql";
import { Changelog, TBoard } from "./parseBingosyncData";
import { getResult, getResultSql } from "./computeResult";
import { Match } from "./Matches";
import fetchMatch from "./fetchMatch";
import { readSession, writeSession } from "../session/sessionUtil";

interface LeagueUpdate extends LeagueInfo {
  type: "league";
}

type NonLeagueUpdate = {
  type: "nonleague";
  name: string;
};

export type LeagueInfoUpdate = LeagueUpdate | NonLeagueUpdate;

export default async function updateLeagueInfo(
  id: string,
  update: LeagueInfoUpdate
): Promise<void> {
  const [match, session] = await Promise.all([fetchMatch(id), readSession()]);
  if (match == null) {
    throw new Error(`Match ${id} not found!`);
  }
  if (session == null) {
    throw new Error("No session found!");
  }
  if (session.admin === false && session.id !== match.creatorID) {
    throw new Error("You do not have permission to update this match!");
  }

  const matchResultSql = getMatchResultSql(match, update);
  const gameSuffix =
    update.type === "league" && update.game != null
      ? `, Game ${update.game}`
      : "";

  const sql = getSql(false);
  const result =
    update.type === "league"
      ? await sql`
        UPDATE match
        SET
          ${matchResultSql}
          name = ${update.p1 + " vs " + update.p2 + gameSuffix},
          league_season = ${update.season},
          league_week = ${update.week},
          league_tier = ${update.tier},
          league_p1 = ${update.p1},
          league_p2 = ${update.p2},
          league_game = ${update.game}
        WHERE id = ${id}
        RETURNING ${MATCH_FIELDS}`
      : await sql`
        UPDATE match
        SET
          ${matchResultSql}
          name = ${update.name},
          league_season = NULL,
          league_week = NULL,
          league_tier = NULL,
          league_p1 = NULL,
          league_p2 = NULL,
          league_game = NULL
        WHERE id = ${id}
        RETURNING ${MATCH_FIELDS}`;
  revalidatePath("/matches");
  revalidatePath(`/match/${id}`);
  const rawMatch = result[0];
  const finalMatch = getMatchFromRaw(rawMatch);
  await syncToGSheet(finalMatch);
  await writeSession(session);
}

function getMatchResultSql(
  match: Match | null,
  update: LeagueUpdate | NonLeagueUpdate
): SQL {
  if (
    match == null ||
    match.boardJson == null ||
    match.boardJson === "" ||
    match.changelogJson == null ||
    match.changelogJson === ""
  ) {
    // shouldn't need this, but for some reason interpolating the empty string fails
    return getSql()`
      winner_name = NULL,
      winner_color = NULL,
      winner_score = NULL,
      winner_bingo = FALSE,
      opponent_name = NULL,
      opponent_color = NULL,
      opponent_score = NULL,
    `;
  }
  const board: TBoard = JSON.parse(match.boardJson);
  const changelog: Changelog = JSON.parse(match.changelogJson);

  const leagueP1 = update.type === "league" ? update.p1 : null;
  const leagueP2 = update.type === "league" ? update.p2 : null;
  return getResultSql(getResult(board, changelog, leagueP1, leagueP2));
}
