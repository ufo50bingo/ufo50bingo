import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { NewFeedItem } from "@/app/fetchFeed";

export const SUPABASE_URL = "https://wqiuxuxjvwmxpslsojni.supabase.co";

export const FEED_EVENT = "feed";

export function getFeedTopic(gameId: number): string {
  return `game:${gameId}:feed`;
}

export type FeedBroadcastPayload = {
  senderId: null | string;
  items: ReadonlyArray<NewFeedItem>;
};

let client: null | SupabaseClient = null;

export default function getSupabaseClient(): SupabaseClient {
  if (client == null) {
    const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY;
    if (publicKey == null) {
      throw new Error("NEXT_PUBLIC_SUPABASE_PUBLIC_KEY is not set");
    }
    client = createClient(SUPABASE_URL, publicKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { heartbeatIntervalMs: 1500 },
    });
  }
  return client;
}
