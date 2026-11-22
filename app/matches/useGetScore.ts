import { useCallback, useMemo } from "react";
import { BingosyncColor } from "./parseBingosyncData";

export default function useGetScore(
  squareColors: ReadonlyArray<ReadonlyArray<BingosyncColor>>,
): (color: BingosyncColor) => number {
  const scores = useMemo(() => {
    const result = new Map<BingosyncColor, number>();
    for (const colorsOnSquare of squareColors) {
      for (const color of colorsOnSquare) {
        result.set(color, (result.get(color) ?? 0) + 1);
      }
    }
    return result;
  }, [squareColors]);
  return useCallback(
    (color: BingosyncColor) => scores.get(color) ?? 0,
    [scores],
  );
}
