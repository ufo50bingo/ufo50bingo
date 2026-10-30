"use server";

import broadcastToWebsockets from "../../broadcastToWebsockets";
import getSql from "@/app/getSql";
import { FeedCurrentSubcategory } from "@/app/fetchFeed";

type Input = {
  gameId: number;
  userId: number;
  subcategoryId: number | null;
};

export default async function addCurrentSubcategory({
  gameId,
  userId,
  subcategoryId,
}: Input): Promise<void> {
  const now = new Date();
  const feedItem: FeedCurrentSubcategory = {
    type: "current_subcategory",
    time: now.getTime() / 1000,
    userId,
    subcategoryId,
  };

  const sql = getSql(false);
  await Promise.all([
    sql`
      INSERT INTO current_subcategory (
        game_id,
        time,
        user_id,
        subcategory_id
      )
      VALUES (
        ${gameId},
        ${now.toISOString()},
        ${userId},
        ${subcategoryId}
    )`,
    broadcastToWebsockets(String(gameId), JSON.stringify(feedItem)),
  ]);
}
