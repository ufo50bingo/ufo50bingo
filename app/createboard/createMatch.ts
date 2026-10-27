"use server";

import { METADATA, Variant } from "../pastas/metadata";
import { RoomBackend } from "../roomApi";
import { UFOPasta } from "../generator/ufoGenerator";
import { hashJson, storePasta } from "../pastaStorage";
import { auth } from "../auth";
import { headers } from "next/headers";
import findGoal from "../findGoal";
import getSql from "../getSql";
import joinValues from "../joinValues";

export interface LeagueInfo {
  season: number;
  tier: string;
  week: string;
  game: number | null;
  p1: string;
  p2: string;
}

export interface CommonMatchProps {
  roomName: string;
  password: string;
  leagueInfo: LeagueInfo | null;
  isPublic: boolean;
  variant: Variant;
  isCustom: boolean;
  isDraft: boolean;
  isLockout: boolean;
  roomBackend: RoomBackend;
}

interface Props extends CommonMatchProps {
  goals: ReadonlyArray<string>;
  bingosyncVariant: string;
  fullPasta: null | UFOPasta;
}

export default async function createMatch({
  roomName,
  password,
  isPublic,
  variant,
  isCustom,
  isDraft,
  isLockout,
  goals,
  leagueInfo: _leagueInfo,
  roomBackend: _roomBackend,
  fullPasta,
}: Props): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session == null) {
    throw new Error("Not authenticated");
  }
  const userId = Number(session.user.id);
  const pastaToStore = getFullPasta(fullPasta, variant);
  let hash: null | bigint = null;
  let json: null | string = null;
  if (pastaToStore != null) {
    json = JSON.stringify(pastaToStore);
    hash = hashJson(json);
  }

  const sql = getSql(false);
  const goalTextValues = [];
  const goalIndexValues = goals.map(
    (name, index) => sql`(${name}, ${index}::smallint)`,
  );
  for (const name of goals) {
    let unresolvedName = null;
    if (pastaToStore != null) {
      const foundGoal = findGoal(name, pastaToStore);
      if (foundGoal != null && foundGoal.goal !== name) {
        unresolvedName = foundGoal.goal;
      }
    }
    goalTextValues.push(sql`(${name}, ${unresolvedName})`);
  }

  const matchInsertSql = sql`INSERT INTO game (
    name,
    password,
    is_public,
    variant,
    is_custom,
    is_draft,
    is_lockout,
    creator_id,
    pasta_id,
    width,
    height
  ) VALUES (
    ${roomName},
    ${password},
    ${bool(isPublic)},
    ${variant},
    ${bool(isCustom)},
    ${bool(isDraft)},
    ${bool(isLockout)},
    ${userId},
    ${hash},
    5,
    5
  ) RETURNING id`;

  const mainCreateSql = sql`
    WITH

    input_texts(name, unresolved_name) AS (
      VALUES ${joinValues(sql, goalTextValues)}
    ),

    inserted_texts AS (
      INSERT INTO goal_text (name)
      
      SELECT name
      FROM input_texts
      UNION ALL
      SELECT unresolved_name
      FROM input_texts
      WHERE unresolved_name IS NOT NULL

      ON CONFLICT (name) DO NOTHING
      RETURNING id, name
    ),

    new_game AS (
      ${matchInsertSql}
    ),

    goal_indices(name, index) AS (
      VALUES ${joinValues(sql, goalIndexValues)}
    ),

    to_insert_game_goals AS (
      SELECT goal_indices.index, goal_text.id
      FROM goal_indices
      INNER JOIN goal_text
      ON goal_text.name = goal_indices.name

      UNION ALL

      SELECT goal_indices.index, inserted_texts.id
      FROM goal_indices
      INNER JOIN inserted_texts
      ON inserted_texts.name = goal_indices.name
    ),

    game_goals AS (
      INSERT INTO game_goal (game_id, goal_id, index)
      SELECT new_game.id, to_insert_game_goals.id AS goal_id, to_insert_game_goals.index 
      FROM to_insert_game_goals
      CROSS JOIN new_game
    )

    SELECT id
    FROM new_game
  `;

  // how should parents work if two identical goal texts
  // can come from different unresolved parents?
  // given an unresolved parent, how do we know the token values???
  const setUnresolvedIdSql = sql`
    WITH input_texts(name, unresolved_name) AS (
      VALUES ${joinValues(sql, goalTextValues)}
    ),
    text_to_update AS (
      SELECT
        goal_text.id,
        unresolved.id AS unresolved_id
      FROM input_texts
      JOIN goal_text
        ON goal_text.name = input_texts.name
      JOIN goal_text unresolved
        ON unresolved.name = input_texts.unresolved_name
      WHERE input_texts.unresolved_name IS NOT NULL
      AND goal_text.unresolved_id IS NULL
    )
    UPDATE goal_text
    SET unresolved_id = text_to_update.unresolved_id
    FROM text_to_update
    WHERE goal_text.id = text_to_update.id
  `;

  const [sqlResult, _] = await Promise.all([
    sql.transaction([mainCreateSql, setUnresolvedIdSql]),
    storePastaIfNecessary(json, hash),
  ]);

  return String(sqlResult[0][0].id);
}

function getFullPasta(
  fullPasta: UFOPasta | null,
  variant: Variant,
): UFOPasta | null {
  if (fullPasta != null) {
    return fullPasta;
  }
  const metadata = METADATA.find((d) => d.name === variant);
  if (metadata != null && metadata.type === "UFO") {
    return metadata.pasta;
  }
  return null;
}

function bool(val: boolean): "TRUE" | "FALSE" {
  return val ? "TRUE" : "FALSE";
}

async function storePastaIfNecessary(
  json: null | string,
  hash: null | bigint,
): Promise<void> {
  if (json != null && hash != null) {
    return await storePasta(json, hash);
  }
  return;
}
