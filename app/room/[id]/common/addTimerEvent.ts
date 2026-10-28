"use server";

import getUserId from "@/app/getUserId";
import broadcastToWebsockets from "../../broadcastToWebsockets";
import getSql from "@/app/getSql";
import { SyncedTimerEventName } from "./useSyncedTimer";
import { FeedTimerEvent } from "@/app/fetchFeed";

type TimerEventInput = {
  gameId: number;
  event: SyncedTimerEventName;
  time: number;
  duration: null | number;
};

export default async function addTimerEvent({
  gameId,
  event,
  time,
  duration,
}: TimerEventInput): Promise<void> {
  const userId = await getUserId();
  const sql = getSql(false);

  const feedItem: FeedTimerEvent = {
    type: "timer_event",
    time,
    userId,
    event,
    duration,
  };
  await Promise.all([
    sql`
      INSERT INTO timer_event (
        game_id,
        time,
        user_id,
        event,
        duration
      )
      VALUES (
        ${gameId},
        ${new Date(time * 1000).toISOString()},
        ${userId},
        ${event},
        ${duration}
    )`,
    broadcastToWebsockets(String(gameId), JSON.stringify(feedItem)),
  ]);
}
