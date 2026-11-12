"use server";

import broadcastToWebsockets from "../../broadcastToWebsockets";
import getSql from "@/app/getSql";
import { FeedPlayerOrder } from "@/app/fetchFeed";

export default async function addPlayerOrder(
  gameId: number,
  orderedIds: ReadonlyArray<number>,
): Promise<void> {
  const now = new Date();
  const feedItem: FeedPlayerOrder = {
    type: "player_order",
    time: now.getTime() / 1000,
    orderedIds,
  };

  const sql = getSql(false);
  await Promise.all([
    sql`
      INSERT INTO player_order (
        game_id,
        time,
        ordered_ids
      )
      VALUES (
        ${gameId},
        ${now.toISOString()},
        ${orderedIds}
    )`,
    broadcastToWebsockets(String(gameId), JSON.stringify(feedItem)),
  ]);
}
