"use server";

import { LeagueInfo } from "../createboard/createMatch";

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
  oldSeason: number | null | undefined,
  update: LeagueInfoUpdate,
): Promise<void> {
  // TODO: Fix updating league info
}
