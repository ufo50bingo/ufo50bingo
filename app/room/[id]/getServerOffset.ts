import getSupabaseClient from "./cast/getSupabaseClient";

export default async function getServerOffset(): Promise<number> {
  const supabase = getSupabaseClient();
  const trials = [];
  for (let i = 0; i < 3; i++) {
    const start = Date.now();
    const { data } = await supabase.rpc("get_server_time_ms");
    const end = Date.now();

    // assume symmetric latency
    const latency = (end - start) / 2;

    // this is the time in the user's browser at the (estimated) instant that the server computes its timestamp
    const clientTime = start + latency;
    const offset = data - clientTime;
    trials.push(offset);
  }
  return trials.reduce((acc, next) => acc + next) / trials.length;
}
