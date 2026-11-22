import { NewFeed } from "@/app/fetchFeed";

function getSquareCompletionRanges(
  feedWithoutMistakes: NewFeed,
  boardSize: number,
): ReadonlyArray<[number, number, number] | null> {
  const finalTimes: ([number, number, number] | null)[] =
    Array(boardSize).fill(null);
  const prevTimeByPlayer: Map<number, number> = new Map();

  // match time = accumulatedMatchTime + time since runningSince, if running
  let hasStarted = false;
  let accumulatedMatchTime = 0;
  let runningSince: null | number = null;
  const stopClock = (time: number) => {
    if (runningSince != null) {
      accumulatedMatchTime += Math.max(time - runningSince, 0);
      runningSince = null;
    }
  };

  for (const item of feedWithoutMistakes) {
    if (item.type === "timer_event") {
      if (item.event === "start") {
        hasStarted = true;
        runningSince ??= item.time;
      } else if (item.event === "pause") {
        stopClock(item.time);
      }
      continue;
    }
    if (item.type === "end_game") {
      stopClock(item.time);
      continue;
    }
    if (item.type !== "color_mark") {
      continue;
    }
    if (item.isClear) {
      finalTimes[item.squareIndex] = null;
    } else if (hasStarted) {
      const matchTime =
        accumulatedMatchTime +
        (runningSince != null ? Math.max(item.time - runningSince, 0) : 0);
      const prevTime = prevTimeByPlayer.get(item.userId) ?? 0;
      finalTimes[item.squareIndex] = [item.userId, prevTime, matchTime];
      prevTimeByPlayer.set(item.userId, matchTime);
    }
  }
  return finalTimes;
}

export default function getOverlays(
  feedWithoutMistakes: NewFeed,
  boardSize: number,
): ReadonlyArray<null | string> {
  const orders: (null | number)[] = Array(boardSize).fill(null);
  let count = 1;
  const ranges = getSquareCompletionRanges(feedWithoutMistakes, boardSize);

  for (const item of feedWithoutMistakes) {
    if (item.type !== "color_mark") {
      continue;
    }
    if (item.isClear) {
      const oldOrder = orders[item.squareIndex];
      orders[item.squareIndex] = null;
      if (oldOrder != null) {
        for (let i = 0; i < boardSize; i++) {
          const thisOrder = orders[i];
          if (thisOrder != null && thisOrder > oldOrder) {
            orders[i] = thisOrder - 1;
          }
        }
      }
      count -= 1;
    } else {
      orders[item.squareIndex] = count;
      count += 1;
    }
  }

  return orders.map((order, index) => {
    const orderStr = order == null ? "#?" : `#${order}`;

    const range = ranges[index];
    if (order == null && range == null) {
      return null;
    }

    const timeStr =
      range != null ? ((range[2] - range[1]) / 60).toFixed(1) : null;

    let finalOverlay = orderStr;
    if (timeStr != null) {
      finalOverlay += `, ${timeStr}m`;
    }
    return finalOverlay;
  });
}
