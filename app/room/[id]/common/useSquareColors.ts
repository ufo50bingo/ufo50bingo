import { NewFeed } from "@/app/fetchFeed";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { useMemo } from "react";

export default function useSquareColors(
  feed: NewFeed,
  boardSize: number,
  isLockout: boolean,
): ReadonlyArray<ReadonlyArray<BingosyncColor>> {
  return useMemo(() => {
    const colors: Array<Array<BingosyncColor>> = Array(boardSize)
      .fill(null)
      .map((_) => []);
    for (const item of feed) {
      if (item.type === "color_mark") {
        const curColors = colors[item.squareIndex];
        if (item.isClear) {
          colors[item.squareIndex] = curColors.filter((c) => c !== item.color);
        } else if (isLockout) {
          if (curColors.length === 0) {
            colors[item.squareIndex] = [item.color];
          }
        } else {
          if (!curColors.includes(item.color)) {
            curColors.push(item.color);
          }
        }
      }
    }
    return colors;
  }, [feed, isLockout, boardSize]);
}
