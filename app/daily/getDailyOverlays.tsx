import { ReactNode } from "react";
import { DailyFeedRow } from "../db";

export default function getDailyOverlays(
  feedIndex: number,
  feedWithDuration: [number, DailyFeedRow][]
): ReadonlyArray<null | ReactNode> {
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

  const overlays: (null | ReactNode)[] = Array(25).fill(null);
  completedOnly.forEach(([squareIndex, _time, duration], index) => {
    const ms = index > 0 ? duration - completedOnly[index - 1][2] : duration;
    const timeStr = (ms / 60000).toFixed(1);
    overlays[squareIndex] = `#${index + 1}, ${timeStr}m`;
  });
  return overlays;
}
