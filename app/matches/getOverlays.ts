import { ReactNode } from "react";
import { getSquareCompletionRanges } from "./analyzeMatch";
import { Change } from "./parseBingosyncData";

export default function getOverlays(
  changes: ReadonlyArray<Change>,
  matchStartTime: number | null,
): ReadonlyArray<null | ReactNode> {
  const orders: (null | number)[] = Array(25).fill(null);
  let count = 1;
  const ranges = getSquareCompletionRanges(matchStartTime, changes);

  changes.forEach((change) => {
    if (change.color == "blank") {
      const oldOrder = orders[change.index];
      orders[change.index] = null;
      if (oldOrder != null) {
        for (let i = 0; i < 25; i++) {
          const thisOrder = orders[i];
          if (thisOrder != null && thisOrder > oldOrder) {
            orders[i] = thisOrder - 1;
          }
        }
      }
      count -= 1;
    } else {
      orders[change.index] = count;
      count += 1;
    }
  });

  const overlays = Array(25)
    .fill(null)
    .map((_, index) => {
      const order = orders[index];
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
  return overlays;
}
