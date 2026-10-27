"use server";

import getUserId from "@/app/getUserId";
import { NewFeedItem } from "../play/PlayPage";
import broadcastToWebsockets from "../../broadcastToWebsockets";
import getSql from "@/app/getSql";

export default async function sendChat(
  gameId: number,
  message: string,
  visibleToPlayers: null | ReadonlyArray<number>,
): Promise<void> {
  const userId = await getUserId();
  const now = new Date();
  const feedItem: NewFeedItem = {
    type: "chat",
    time: now.getTime() / 1000,
    user: {
      id: userId,
      name: "Unknown",
    },
    message,
    visibleToPlayers,
  };

  const sql = getSql(false);
  await Promise.all([
    sql`
      INSERT INTO chat (
        game_id,
        time,
        user_id,
        message,
        visible_to_players
      )
      VALUES (
        ${gameId},
        ${now.toISOString()},
        ${userId},
        ${message},
        ${visibleToPlayers}
    )`,
    broadcastToWebsockets(String(gameId), JSON.stringify(feedItem)),
  ]);
}
