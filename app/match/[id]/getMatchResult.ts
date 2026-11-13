import { BingosyncColor } from "@/app/color";
import { NewFeed } from "@/app/fetchFeed";
import { WinType } from "@/app/matches/matchUtil";
import BoardState, { BoardStateParams } from "./BoardState";

type TeamResult = {
  color: BingosyncColor;
  score: number;
  winType: null | WinType;
};

export default function getMatchResult(
  feedWithoutMistakes: NewFeed,
  boardStateParams: BoardStateParams,
) {
  const boardState = new BoardState(boardStateParams);
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
    const wasMeaningful = boardState.apply(item);
    if (!wasMeaningful) {
      continue;
    }
    let firstScoreTimes = firstTimeReachingScore.get(item.color);
    if (firstScoreTimes == null) {
      firstScoreTimes = [];
      firstTimeReachingScore.set(item.color, firstScoreTimes);
    }
    if (item.isClear) {
      firstScoreTimes.pop();
    } else {
      firstScoreTimes.push(feedIndex);
    }
    const hasBingo = boardState.hasBingo(item.color);
    const prevFirstBingoTime = firstBingoTime.get(item.color);
    if (hasBingo && prevFirstBingoTime == null) {
      firstBingoTime.set(item.color, feedIndex);
    } else if (!hasBingo && prevFirstBingoTime != null) {
      firstBingoTime.set(item.color, null);
    }
  }

  const scores = boardState.getScores();

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
