import { ReactNode } from "react";
import { DailyFeedRow } from "../db";
import getDailyTimes from "./getDailyTimes";

export default function getDailyOverlays(
  feedIndex: number,
  feedWithDuration: [number, DailyFeedRow][]
): ReadonlyArray<null | ReactNode> {
  const completedOnly = getDailyTimes(feedIndex, feedWithDuration);

  const overlays: (null | ReactNode)[] = Array(25).fill(null);
  completedOnly.forEach(([squareIndex, _time, duration], index) => {
    const ms = index > 0 ? duration - completedOnly[index - 1][2] : duration;
    const timeStr = (ms / 60000).toFixed(1);
    overlays[squareIndex] = `#${index + 1}, ${timeStr}m`;
  });
  return overlays;
}
