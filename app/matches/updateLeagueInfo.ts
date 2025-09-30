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
  const match = await fetchMatch(id);
  const matchResultSql = getMatchResultSql(match, update);

  const sql = getSql(false);
  const result =
    update.type === "league"
      ? await sql`
        UPDATE match
        SET
          ${matchResultSql}
          name = ${update.p1 + " vs " + update.p2},
          league_season = ${update.season},
          league_week = ${update.week},
          league_tier = ${update.tier},
          league_p1 = ${update.p1},
          league_p2 = ${update.p2}
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
          league_p2 = NULL
        WHERE id = ${id}
        RETURNING ${MATCH_FIELDS}`;
  revalidatePath("/matches");
  revalidatePath(`/match/${id}`);
  const rawMatch = result[0];
  const finalMatch = getMatchFromRaw(rawMatch);
  await syncToGSheet(finalMatch);
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
