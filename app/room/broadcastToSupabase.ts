// THIS CANNOT BE USE SERVER

import { NewFeedItem } from "@/app/fetchFeed";
import {
  FEED_EVENT,
  FeedBroadcastPayload,
  getFeedTopic,
  SUPABASE_URL,
} from "./[id]/common/getSupabaseClient";

export default async function broadcastToSupabase(
  gameId: number,
  items: ReadonlyArray<NewFeedItem>,
  senderId: null | string,
): Promise<void> {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (secretKey == null) {
    console.error("Supabase broadcast failed: SUPABASE_SECRET_KEY is not set");
    return;
  }
  const payload: FeedBroadcastPayload = { senderId, items };
  const headers: Record<string, string> = {
    apikey: secretKey,
    "Content-Type": "application/json",
  };
  try {
    const response = await fetch(`${SUPABASE_URL}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages: [
          {
            topic: getFeedTopic(gameId),
            event: FEED_EVENT,
            payload,
            private: true,
          },
        ],
      }),
    });
    if (!response.ok) {
      console.error(
        "Supabase broadcast failed",
        response.status,
        await response.text(),
      );
    }
  } catch (error) {
    console.error("Supabase broadcast failed", error);
  }
}
