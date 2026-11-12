"use server";

import { FeedMember } from "@/app/fetchFeed";
import getSql from "@/app/getSql";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import broadcastToWebsockets from "../broadcastToWebsockets";
import getSession from "@/app/getSession";
import { refresh } from "next/cache";
import { auth } from "@/app/auth";
import { headers } from "next/headers";

export default async function joinGame(
  gameId: number,
  playerColor: null | BingosyncColor,
  overrideName: null | string,
  password: null | string,
): Promise<void> {
  const session = await getSession();
  if (session == null) {
    throw new Error("You must log in before joining the game!");
  }
  const userId = Number(session.user.id);
  const sql = getSql(false);
  const [passwordResult, isInvitedResult] = await sql.transaction([
    sql`
      SELECT password
      FROM game
      WHERE id = ${gameId}
    `,
    sql`
      SELECT 1 as dummy
      FROM member
      WHERE
        user_id = ${userId}
        AND game_id = ${gameId}
      LIMIT 1
    `,
  ]);
  const passwordsMatch = passwordResult[0].password === password;
  const isInvited = isInvitedResult.length > 0;
  if (!passwordsMatch && !isInvited) {
    throw new Error("Incorrect password provided");
  }
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
    broadcastToWebsockets(gameId, JSON.stringify(feedItem)),
    auth.api.updateUser({
      headers: await headers(),
      body: { color: playerColor },
    }),
  ]);
  refresh();
}
