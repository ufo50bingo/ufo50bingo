"use server";

import { FeedMember } from "@/app/fetchFeed";
import getSql from "@/app/getSql";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import broadcastToWebsockets from "../broadcastToWebsockets";
import getSession from "@/app/getSession";
import { refresh } from "next/cache";

export default async function joinGame(
  gameId: number,
  playerColor: null | BingosyncColor,
  overrideName: null | string,
): Promise<void> {
  const session = await getSession();
  if (session == null) {
    throw new Error("You must log in before joining the game!");
  }
  const userId = Number(session.user.id);
  const sql = getSql(false);
  const now = new Date();
  const feedItem: FeedMember = {
    type: "member",
    time: now.getTime() / 1000,
    userId,
    isInvite: false,
    playerColor,
    name: session.user.name,
    overrideName,
  };
  await Promise.all([
    sql`
      INSERT INTO member (
        game_id,
        user_id,
        player_color,
        time,
        is_invite,
        override_name
      )
      VALUES (
        ${gameId},
        ${userId},
        ${playerColor},
        ${now.toISOString()},
        FALSE,
        ${overrideName}
    )`,
    broadcastToWebsockets(String(gameId), JSON.stringify(feedItem)),
  ]);
  refresh();
}
