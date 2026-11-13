import { BingosyncColor } from "@/app/color";
import { NewFeed } from "@/app/fetchFeed";
import getBingoLines from "@/app/generator/getBingoLines";
import { WinType } from "@/app/matches/matchUtil";

type TeamResult = {
  color: BingosyncColor;
  score: number;
  winType: null | WinType;
};

type Props = {
  feedWithoutMistakes: NewFeed;
  isLockout: boolean;
  rows: number;
  cols: number;
};

export default function getMatchResult({
  feedWithoutMistakes,
  isLockout,
  rows,
  cols,
}: Props) {
  const allSquareColors: Array<Set<BingosyncColor>> = Array(rows * cols)
    .fill(null)
    .map((_) => new Set());
  const bingoLinesObj = getBingoLines(rows, cols);
  const bingoLines = bingoLinesObj.rowsAndCols.concat(bingoLinesObj.diagonals);
  // the 0th index is the first time reaching score 1. The 1st index
  // is the first time reaching score 2. We keep this as an array so mismarks
  // (where a player reaches score N and then later goes back to N-1) still have
  // all times accurate
  const firstTimeReachingScore = new Map<BingosyncColor, Array<number>>();
  // first time this color reached a bingo
  const firstBingoTime = new Map<BingosyncColor, null | number>();
  for (const [feedIndex, item] of feedWithoutMistakes.entries()) {
    if (item.type !== "color_mark") {
      continue;
    }
    const squareColors = allSquareColors[item.squareIndex];
    let firstScoreTimes = firstTimeReachingScore.get(item.color);
    if (firstScoreTimes == null) {
      firstScoreTimes = [];
      firstTimeReachingScore.set(item.color, firstScoreTimes);
    }
    if (item.isClear) {
      if (!squareColors.has(item.color)) {
        continue;
      }
      squareColors.delete(item.color);
      firstScoreTimes.pop();
    } else {
      if (
        squareColors.has(item.color) ||
        (isLockout && squareColors.size > 0)
      ) {
        continue;
      }
      squareColors.add(item.color);
      firstScoreTimes.push(feedIndex);
    }
    const hasBingo = bingoLines.some((line) =>
      line.every((squareIndex) => allSquareColors[squareIndex].has(item.color)),
    );
    const prevFirstBingoTime = firstBingoTime.get(item.color);
    if (hasBingo && prevFirstBingoTime == null) {
      firstBingoTime.set(item.color, feedIndex);
    } else if (!hasBingo && prevFirstBingoTime != null) {
      firstBingoTime.set(item.color, null);
    }
  }

  const scores = new Map<BingosyncColor, number>();
  for (const squareColors of allSquareColors) {
    for (const color of squareColors) {
      scores.set(color, (scores.get(color) ?? 0) + 1);
    }
  }

  const teams: Array<TeamResult> = [...scores.entries()].map(
    ([color, score]) => ({ color, score, winType: null }),
  );
  teams.sort((a, b) => {
    const aBingoTime = firstBingoTime.get(a.color);
    const bBingoTime = firstBingoTime.get(b.color);
    if (aBingoTime != null && bBingoTime != null) {
      return aBingoTime - bBingoTime;
    } else if (aBingoTime != null) {
      return -1;
    } else if (bBingoTime != null) {
      return 1;
    }

    if (a.score !== b.score) {
      return b.score - a.score;
    }

    return (
      firstTimeReachingScore.get(a.color)![a.score - 1] -
      firstTimeReachingScore.get(b.color)![b.score - 1]
    );
  });

  if (teams.length > 0) {
    const winningTeam = teams[0];
    const hasBingo = firstBingoTime.get(winningTeam.color) != null;
    let winType: WinType = "Majority";
    if (hasBingo) {
      winType = "Bingo";
    } else if (teams.length > 1 && teams[1].score === winningTeam.score) {
      winType = "Tiebreak";
    }
    winningTeam.winType = winType;
  }

  return teams;
}
