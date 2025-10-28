import { DailyFeedRow } from "../db";

export default function getBoardAtIndex(feed: ReadonlyArray<DailyFeedRow>, lastIndex: number): ReadonlyArray<boolean> {
  const board = Array(25).fill(false);
  for (let i = 0; i <= lastIndex; i++) {
    const squareIndex = feed[i].squareIndex;
    if (squareIndex == null) {
      continue;
    }
    if (feed[i].type === "mark") {
      board[squareIndex] = true;
    } else if (feed[i].type === "clear") {
      board[squareIndex] = false;
    }
  }
  return board;
}