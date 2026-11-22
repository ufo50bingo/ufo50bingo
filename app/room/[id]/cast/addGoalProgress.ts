"use server";

import broadcastToWebsockets from "../../broadcastToWebsockets";
import getSql from "@/app/getSql";
import { FeedGoalProgress } from "@/app/fetchFeed";

type Input = {
  gameId: number;
  goalId: number;
  userId: number;
  subcategoryId: number;
  count: number;
};

export default async function addGoalProgress({
  gameId,
  userId,
  goalId,
  subcategoryId,
  count,
}: Input): Promise<void> {
  const now = new Date();
  const feedItem: FeedGoalProgress = {
    type: "goal_progress",
    time: now.getTime() / 1000,
    userId,
    goalId,
    subcategoryId,
    count,
  };

  const sql = getSql(false);
  await Promise.all([
    sql`
      INSERT INTO goal_progress (
        game_id,
        time,
        user_id,
        goal_id,
        subcategory_id,
        count
      )
      VALUES (
        ${gameId},
        ${now.toISOString()},
        ${userId},
        ${goalId},
        ${subcategoryId},
        ${count}
    )`,
    broadcastToWebsockets(String(gameId), JSON.stringify(feedItem)),
  ]);
}
