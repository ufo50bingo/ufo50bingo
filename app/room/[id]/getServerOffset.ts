import getSupabaseClient from "./cast/getSupabaseClient";

export default async function getServerOffset(
  numTrials: number,
): Promise<number> {
  const maxAttemptedTrials = numTrials * 5;
  const supabase = getSupabaseClient();
  let offsetSum = 0;
  let numCompletedTrials = 0;
  for (let numAttemptedTrials = 0; numAttemptedTrials < maxAttemptedTrials && numCompletedTrials < numTrials; numAttemptedTrials++) {
    const start = Date.now();
    const { data, error } = await supabase.rpc("get_server_time_ms");
    if (error != null || data == null || data === 0) {
      continue;
    }

    const end = Date.now();

    // assume symmetric latency
    const latency = (end - start) / 2;

    // this is the time in the user's browser at the (estimated) instant that the server computes its timestamp
    const clientTime = start + latency;
    const offset = data - clientTime;
    offsetSum += offset;
    numCompletedTrials += 1;
  }
  if (numCompletedTrials === 0) {
    return 0;
  }
  return Math.round(offsetSum / numCompletedTrials);
}
