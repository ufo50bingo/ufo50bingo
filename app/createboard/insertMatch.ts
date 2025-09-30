"use server";

import { revalidatePath } from "next/cache";
import { CommonMatchProps } from "./createMatch";
import getSql from "../getSql";

interface Props extends CommonMatchProps {
  id: string;
  cookie: string;
}

function bool(val: boolean): "TRUE" | "FALSE" {
  return val ? "TRUE" : "FALSE";
}

export async function insertMatch({
  id,
  roomName,
  password,
  isPublic,
  variant,
  isCustom,
  isLockout,
  leagueInfo,
  cookie,
}: Props): Promise<void> {
  const sql = getSql(false);

  await sql`INSERT INTO match (
    id,
    name,
    password,
    is_public,
    variant,
    is_custom,
    is_lockout,
    league_season,
    league_week,
    league_tier,
    league_p1,
    league_p2,
    sessionid_cookie
  ) VALUES (
    ${id},
    ${roomName},
    ${password},
    ${bool(isPublic)},
    ${variant},
    ${bool(isCustom)},
    ${bool(isLockout)},
    ${leagueInfo?.season},
    ${leagueInfo?.week},
    ${leagueInfo?.tier},
    ${leagueInfo?.p1},
    ${leagueInfo?.p2},
    ${cookie}
  );`;
  revalidatePath("/matches");
}
