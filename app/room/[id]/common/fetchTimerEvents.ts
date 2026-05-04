import getSupabaseClient from "../cast/getSupabaseClient";
import { FullSyncedTimerEvent } from "./useSyncedTimer";

export default async function fetchTimerEvents(
  id: string,
): Promise<ReadonlyArray<FullSyncedTimerEvent>> {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from("timer_event")
    .select()
    .eq("room_id", id);
  return data ?? [];
}
