export default async function getServerOffset(
  numTrials: number,
  keepBest: number,
): Promise<number> {
  const maxAttemptedTrials = numTrials * 5;

  const bestTrials: { latency: number; offset: number }[] = [];

  for (
    let numAttemptedTrials = 0;
    numAttemptedTrials < maxAttemptedTrials &&
    numAttemptedTrials < numTrials * 5;
    numAttemptedTrials++
  ) {
    const start = Date.now();

    try {
      const response = await fetch("/api/servertime", {
        cache: "no-store",
      });
      if (!response.ok) {
        continue;
      }
      const { timestamp } = await response.json();
      if (timestamp == null || timestamp === 0) {
        continue;
      }

      const end = Date.now();
      // assume symmetric latency
      const latency = (end - start) / 2;
      // this is the time in the user's browser at the (estimated) instant that the server computes its timestamp
      const clientTime = start + latency;
      const offset = timestamp - clientTime;

      bestTrials.push({ latency, offset });
      bestTrials.sort((a, b) => a.latency - b.latency);
      if (bestTrials.length > keepBest) {
        bestTrials.pop();
      }
    } catch {
      continue;
    }
  }

  if (bestTrials.length === 0) {
    return 0;
  }
  const offsetSum = bestTrials.reduce((sum, trial) => sum + trial.offset, 0);
  return Math.round(offsetSum / bestTrials.length);
}
