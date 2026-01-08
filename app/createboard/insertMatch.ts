"use server";

import { revalidateTag } from "next/cache";
import { CommonMatchProps } from "./createMatch";
import getSql from "../getSql";
import { Variant } from "../pastas/metadata";

interface Props extends CommonMatchProps {
  id: string;
  cookie: string;
}

function getDefaultAnalysisSeconds(variant: Variant): number {
  switch (variant) {
    case "Choco":
      return 0;
    case "Blitz":
      return 30;
    case "Spicy":
      return 90;
    default:
      return 60;
  }
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
  const sql = getSql();

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
    league_game,
    sessionid_cookie,
    analysis_seconds
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
    ${leagueInfo?.game},
    ${cookie},
    ${getDefaultAnalysisSeconds(variant)}
  );`;
  revalidateTag("matches", "max");
}
