import { DailyFeedRow } from "../db";

export default function getFeedWithDuration(feed: ReadonlyArray<DailyFeedRow>, attempt: number): [number, DailyFeedRow][] {
  let accumulatedDuration = attempt > 0 ? 0 : -60000;
  let curStartTime: null | number = null;

  const withDuration: [number, DailyFeedRow][] = feed.map((item: DailyFeedRow) => {
    switch (item.type) {
      case "clear":
      case "mark":
        break;
      case "reveal":
      case "unpause":
        if (curStartTime == null) {
          curStartTime = item.time;
        }
        break;
      case "pause":
        if (curStartTime != null) {
          accumulatedDuration += item.time - curStartTime;
          curStartTime = null;
        }
        break;
    }
    const thisDuration = curStartTime != null
      ? item.time - curStartTime + accumulatedDuration
      : accumulatedDuration;
    return [thisDuration, item];
  });
  return withDuration;
}