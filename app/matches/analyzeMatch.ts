import {
  BingosyncColor,
  Board,
  Change,
  Changelog,
  PlayerToColors,
} from "./parseBingosyncData";

const BINGO_LINES = [
  // rows
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  // columns
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  // diagonals
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

// check whether the final board state can be recreated from the changelog
export function getIsValid(
  board: Board,
  changes: ReadonlyArray<Change>
): boolean {
  const boardFromChangelog = getFinalColors(changes);
  for (let index = 0; index < 25; index++) {
    if (board[index].color !== boardFromChangelog[index]) {
      return false;
    }
  }
  return true;
}

function getFinalColors(
  changes: ReadonlyArray<Change>
): ReadonlyArray<BingosyncColor> {
  const board: BingosyncColor[] = Array(25).fill("blank");
  changes.forEach((change) => {
    board[change.index] = change.color;
  });
  return board;
}

function isBingoForColors(
  lineIndex: number,
  boardColors: ReadonlyArray<BingosyncColor>,
  playerColors: ReadonlyArray<BingosyncColor>
): boolean {
  return BINGO_LINES[lineIndex].every((squareIndex) =>
    playerColors.includes(boardColors[squareIndex])
  );
}

type BingoLine = {
  player: string;
  lineIndex: number;
};
function getBingoLines(
  boardColors: ReadonlyArray<BingosyncColor>,
  players: PlayerToColors
): ReadonlyArray<BingoLine> {
  const bingoLines: BingoLine[] = [];
  for (let lineIndex = 0; lineIndex < BINGO_LINES.length; lineIndex++) {
    Object.entries(players).forEach(([player, colors]) => {
      if (isBingoForColors(lineIndex, boardColors, colors)) {
        bingoLines.push({ player, lineIndex });
      }
    });
  }
  return bingoLines;
}

export function getFirstBingoPlayer(
  changes: ReadonlyArray<Change>,
  players: PlayerToColors
): null | string {
  const boardFromChangelog: BingosyncColor[] = Array(25).fill("blank");
  let validBingoLines: BingoLine[] = [];
  changes.forEach((change) => {
    boardFromChangelog[change.index] = change.color;
    const curBingoLines = getBingoLines(boardFromChangelog, players);
    // check if lines from previous times are stil valid. If invalid due to
    // a square being unmarked, remove them.
    const newLines = validBingoLines.filter(
      (line) =>
        curBingoLines.find(
          (currentLine) =>
            currentLine.lineIndex === line.lineIndex &&
            currentLine.player === line.player
        ) != null
    );
    // add new lines that weren't present previously
    curBingoLines.forEach((curLine) => {
      if (
        newLines.find(
          (prevLine) =>
            prevLine.lineIndex === curLine.lineIndex &&
            prevLine.player === curLine.player
        ) == null
      ) {
        newLines.push(curLine);
      }
    });
    validBingoLines = newLines;
  });
  return validBingoLines.length > 0 ? validBingoLines[0].player : null;
}

export function getPlayerWithLeastRecentClaim(
  changes: ReadonlyArray<Change>,
  players: PlayerToColors
): string {
  // time that player most recently claimed each square
  // has null if square is not claimed. Set back to null
  // if square is claimed and then unclaimed.
  // The "time" is the position in the changelog
  const playerClaimTimes: { [player: string]: (null | number)[] } = {};
  Object.keys(players).forEach(
    (player) => (playerClaimTimes[player] = Array(25).fill(null))
  );

  changes.forEach((change, changePosition) => {
    if (change.color === "blank") {
      Object.keys(players).forEach((player) => {
        playerClaimTimes[player][change.index] = null;
      });
      return;
    }
    Object.keys(players).forEach((player) => {
      if (players[player].includes(change.color)) {
        playerClaimTimes[player][change.index] = changePosition;
      }
    });
  });

  const finalClaimTimes = Object.keys(players).map((player) =>
    Math.max(...playerClaimTimes[player].filter((position) => position != null))
  );
  const minClaimTime = Math.min(...finalClaimTimes);
  const indexOfBest = finalClaimTimes.findIndex((v) => v === minClaimTime);
  return Object.keys(players)[indexOfBest];
}

// assume match starts 60s after reveal
export function getMatchStartTime(changelog: Changelog): null | number {
  const revealTime = changelog.reveals?.[0]?.time;
  return revealTime == null ? null : revealTime + 60;
}

export function getSquareCompletionTimes(
  matchStartTime: null | number,
  changesWithoutMistakes: ReadonlyArray<Change>
): ReadonlyArray<number | null> {
  const finalTimes = Array(25).fill(null);
  const prevTimeByPlayer: { [player: string]: number } = {};

  changesWithoutMistakes.forEach((change) => {
    if (change.color === "blank") {
      finalTimes[change.index] = null;
    } else {
      const prevTime: null | number =
        prevTimeByPlayer[change.name] ?? matchStartTime;
      if (prevTime != null) {
        finalTimes[change.index] = change.time - prevTime;
      }
      prevTimeByPlayer[change.name] = change.time;
    }
  });
  return finalTimes;
}

// if a square has its color changed from X to Y then back to X within 5 seconds,
// it's considered a mistake and both changes are removed
export function getChangesWithoutMistakes(
  changes: ReadonlyArray<Change>
): ReadonlyArray<Change> {
  const changesBySquare: Change[][] = Array(25)
    .fill(null)
    .map((_) => []);
  changes.forEach((change) => {
    changesBySquare[change.index].push(change);
  });
  changesBySquare.forEach((changesForSquare) =>
    removeMistakesForSquare(changesForSquare)
  );
  const allChanges = changesBySquare.flat();
  allChanges.sort((x, y) => x.time - y.time);
  return allChanges;
}

// changes must ALL CORRESPOND TO THE SAME SQUARE and be ordered
// chronologically
function removeMistakesForSquare(changes: Change[]): void {
  // starting from the end, we check PAIRS of changes. If the pair
  // updates the color from X to Y to X **AND** the time difference
  // between the two items in the pair is < 5 seconds, assume that
  // the first item in the pair was a mistake and the second item
  // corrects it.
  // Since we're looking at pairs, start at the next-to-last item
  let indexOfFirstItem = changes.length - 2;
  while (indexOfFirstItem >= 0) {
    const timeDiff =
      changes[indexOfFirstItem + 1].time - changes[indexOfFirstItem].time;
    const prevColor =
      indexOfFirstItem > 0 ? changes[indexOfFirstItem - 1].color : "blank";
    // changes happened within 5 seconds, and second change canceled out
    // the first change. So we can remove it
    if (timeDiff < 5 && prevColor == changes[indexOfFirstItem + 1].color) {
      // remove the item at indexOfFirstItem and the one after
      changes.splice(indexOfFirstItem, 2);
      // rewind 2 so we're looking at the first item in another pair
      indexOfFirstItem -= 2;
    } else {
      indexOfFirstItem -= 1;
    }
  }
}
