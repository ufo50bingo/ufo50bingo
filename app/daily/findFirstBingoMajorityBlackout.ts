import { DailyFeedRow } from "../db";
import { BINGO_LINES } from "../matches/analyzeMatch";

type Return = {
  bingo: null | number;
  majority: null | number;
  blackout: null | number;
};

export default function getFirstBingoMajorityBlackoutIndex(
  feed: ReadonlyArray<DailyFeedRow>
): Return {
  const board = Array(25).fill(false);
  const firstBingoIndexForLine: (null | number)[] = Array(
    BINGO_LINES.length
  ).fill(null);
  let majority: null | number = null;
  let blackout: null | number = null;
  feed.forEach((item, feedIndex) => {
    if (item.squareIndex == null) {
      return;
    }
    if (item.type === "mark") {
      board[item.squareIndex] = true;
    } else if (item.type === "clear") {
      board[item.squareIndex] = false;
    }
    const squareCount = board.reduce(
      (acc, isMarked) => (isMarked ? acc + 1 : acc),
      0
    );

    if (squareCount === 25 && blackout == null) {
      blackout = feedIndex;
    } else if (squareCount < 25) {
      blackout = null;
    }

    if (squareCount >= 13 && majority == null) {
      majority = feedIndex;
    } else if (squareCount < 13) {
      majority = null;
    }

    BINGO_LINES.forEach((line, lineIndex) => {
      const hasBingo = line.every((squareIndex) => board[squareIndex] === true);
      if (!hasBingo) {
        firstBingoIndexForLine[lineIndex] = null;
      } else {
        if (firstBingoIndexForLine[lineIndex] == null) {
          firstBingoIndexForLine[lineIndex] = feedIndex;
        }
      }
    });
  });
  const allBingoIndexes = firstBingoIndexForLine.filter((i) => i != null);
  const bingo =
    allBingoIndexes.length > 0 ? Math.min(...allBingoIndexes) : null;
  return { bingo, majority, blackout };
}
