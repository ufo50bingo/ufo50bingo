import { DailyFeedRow } from "../db";

export default function getDailyTimes(
  feedIndex: number,
  feedWithDuration: [number, DailyFeedRow][]
): ReadonlyArray<[number, number, number]> {
  const finalMarkTimesAndDurations: (null | [number, number, number])[] =
    Array(25).fill(null);
  for (let i = 0; i <= feedIndex; i++) {
    const [duration, item] = feedWithDuration[i];
    if (item.squareIndex == null) {
      continue;
    }
    if (item.type === "mark") {
      const time = item.time;
      finalMarkTimesAndDurations[item.squareIndex] = [
        item.squareIndex,
        time,
        duration,
      ];
    } else if (item.type === "clear") {
      finalMarkTimesAndDurations[item.squareIndex] = null;
    }
  }
  const completedOnly = finalMarkTimesAndDurations.filter(
    (tuple) => tuple != null
  );
  completedOnly.sort((a, b) => a[1] - b[1]);
  return completedOnly;
}
