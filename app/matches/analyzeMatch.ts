import {
  BingosyncColor,
  Board,
  Change,
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
