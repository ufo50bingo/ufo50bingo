"use server";

import { BingosyncColor } from "@/app/matches/parseBingosyncData";
// import broadcastToWebsockets from "../../broadcastToWebsockets";
import getUserId from "@/app/getUserId";
import getSql from "@/app/getSql";

export default async function changeColor(
  gameId: number,
  squareIndex: number,
  color: BingosyncColor,
  isClear: boolean,
): Promise<void> {
  const now = new Date();
  const userId = await getUserId();
  const sql = getSql(false);
  await sql`
    INSERT INTO color_mark (
      game_id,
      time,
      user_id,
      square_index,
      color,
      is_clear
    )
    VALUES (
      ${gameId},
      ${now.toISOString()},
      ${userId},
      ${squareIndex},
      ${color},
      ${isClear}
  )`;
  // await broadcastToWebsockets(id, JSON.stringify(rawGoal));
}
