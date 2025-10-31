import { SequenceMatcher } from "difflib";
import {
  BingosyncColor,
  TBoard,
  Change,
  Changelog,
  PlayerToColors,
} from "./parseBingosyncData";
import { ALIASES } from "../createboard/leagueConstants";

export const BINGO_LINES = [
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
  board: TBoard,
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

export function getColorWithLeastRecentClaim(
  changes: ReadonlyArray<Change>,
  colors: ReadonlyArray<BingosyncColor>
): string {
  // time that color most recently claimed each square
  // has null if square is not claimed. Set back to null
  // if square is claimed and then unclaimed.
  // The "time" is the position in the changelog
  const colorClaimTimes: { [color: string]: (null | number)[] } = {};
  colors.forEach((color) => (colorClaimTimes[color] = Array(25).fill(null)));

  changes.forEach((change, changePosition) => {
    if (change.color === "blank") {
      colors.forEach((color) => {
        colorClaimTimes[color][change.index] = null;
      });
      return;
    }
    colorClaimTimes[change.color][change.index] = changePosition;
  });

  const finalClaimTimes = colors.map((color) =>
    Math.max(...colorClaimTimes[color].filter((time) => time != null))
  );
  const minClaimTime = Math.min(...finalClaimTimes);
  const indexOfBest = finalClaimTimes.findIndex((v) => v === minClaimTime);
  return colors[indexOfBest];
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

export function getMatchStartTime(
  changelog: Changelog,
  analysisSeconds: number
): null | number {
  const revealTime = changelog.reveals?.[0]?.time;
  return revealTime == null ? null : revealTime + analysisSeconds;
}

export function getSquareCompletionRanges(
  matchStartTime: null | number,
  changesWithoutMistakes: ReadonlyArray<Change>
): ReadonlyArray<[string, number, number] | null> {
  const finalTimes: ([string, number, number] | null)[] = Array(25).fill(null);
  const prevTimeByPlayer: { [player: string]: number } = {};

  changesWithoutMistakes.forEach((change) => {
    if (change.color === "blank") {
      finalTimes[change.index] = null;
    } else {
      const prevTime: null | number =
        prevTimeByPlayer[change.name] ?? matchStartTime;
      if (prevTime != null) {
        finalTimes[change.index] = [change.name, prevTime, change.time];
      }
      prevTimeByPlayer[change.name] = change.time;
    }
  });
  return finalTimes;
}

function getChangesWithoutDuplicates(
  changes: ReadonlyArray<Change>
): ReadonlyArray<Change> {
  return changes.filter((change, idx) => {
    if (idx === 0) {
      return true;
    }
    const prevChange = changes[idx - 1];
    return (
      prevChange.color !== change.color ||
      prevChange.name !== change.name ||
      prevChange.index !== change.index ||
      Math.abs(change.time - prevChange.time) > 1
    );
  });
}

// if a square has its color changed from X to Y then back to X within 5 seconds,
// it's considered a mistake and both changes are removed
// bingosync also sometimes includes the same item in the the feed with very
// slightly different timestamps, so remove those as well
export function getChangesWithoutMistakes(
  changes: ReadonlyArray<Change>
): ReadonlyArray<Change> {
  const withouDuplicates = getChangesWithoutDuplicates(changes);
  const changesBySquare: Change[][] = Array(25)
    .fill(null)
    .map((_) => []);
  withouDuplicates.forEach((change) => {
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
    // changes happened within 6 seconds, and second change canceled out
    // the first change. So we can remove it.
    // NOTE: Using < 6 instead of < 5 because the data from S1 only has
    // 5s resolution, so it's impossible for changes to be < 5s apart
    if (timeDiff < 6 && prevColor == changes[indexOfFirstItem + 1].color) {
      // remove the item at indexOfFirstItem and the one after
      changes.splice(indexOfFirstItem, 2);
      // rewind 2 so we're looking at the first item in another pair
      indexOfFirstItem -= 2;
    } else {
      indexOfFirstItem -= 1;
    }
  }
}

function getTopPlayer(playerToNetAdditiosn: {
  [player: string]: number;
}): string {
  return Object.keys(playerToNetAdditiosn).reduce((a, b) =>
    playerToNetAdditiosn[a] > playerToNetAdditiosn[b] ? a : b
  );
}

function getSimilarity(verifiedName: string, name: string): number {
  const aliases = ALIASES[verifiedName] ?? [];
  const allNames = [verifiedName, ...aliases];
  const allScores = allNames.map((verifiedOrAlias) =>
    new SequenceMatcher(null, verifiedOrAlias, name).ratio()
  );
  return Math.max(...allScores);
}

export function getColorToVerifiedName(
  changes: ReadonlyArray<Change>,
  verifiedP1: string,
  verifiedP2: string
): null | {
  [color: string]: string;
} {
  const board = Array(25).fill("blank");
  const colorToPlayerToNetAdditions: {
    [color: string]: { [player: string]: number };
  } = {};
  changes.forEach((change) => {
    let relevantColor = change.color;
    if (change.color === "blank") {
      relevantColor = board[change.index];
      if (relevantColor === "blank") {
        return;
      }
    }
    board[change.index] = change.color;
    const playerToAdditions = colorToPlayerToNetAdditions[relevantColor] ?? {};
    const curCount = playerToAdditions[change.name] ?? 0;
    const newCount = change.color === "blank" ? curCount - 1 : curCount + 1;
    playerToAdditions[change.name] = newCount;
    colorToPlayerToNetAdditions[relevantColor] = playerToAdditions;
  });

  // if a color has no net additions, remove it from the object
  Object.keys(colorToPlayerToNetAdditions).forEach((color) => {
    const counts = colorToPlayerToNetAdditions[color];
    if (Object.keys(counts).every((name) => counts[name] === 0)) {
      delete colorToPlayerToNetAdditions[color];
    }
  });

  if (Object.keys(colorToPlayerToNetAdditions).length === 2) {
    const c1 = Object.keys(colorToPlayerToNetAdditions)[0];
    const c2 = Object.keys(colorToPlayerToNetAdditions)[1];
    const c1Player = getTopPlayer(colorToPlayerToNetAdditions[c1]);
    const c2Player = getTopPlayer(colorToPlayerToNetAdditions[c2]);

    const sumP1EqC1 =
      getSimilarity(verifiedP1, c1Player) + getSimilarity(verifiedP2, c2Player);
    const sumP1EqC2 =
      getSimilarity(verifiedP1, c2Player) + getSimilarity(verifiedP2, c1Player);

    const result: { [color: string]: string } = {};
    if (sumP1EqC1 >= sumP1EqC2) {
      result[c1] = verifiedP1;
      result[c2] = verifiedP2;
    } else {
      result[c1] = verifiedP2;
      result[c2] = verifiedP1;
    }
    return result;
  }
  return null;
}

export function getVerifiedPlayerToColors(
  changes: ReadonlyArray<Change>,
  leagueP1: string | null | undefined,
  leagueP2: string | null | undefined
): null | PlayerToColors {
  if (leagueP1 == null || leagueP2 == null) {
    return null;
  }
  const colorToVerifiedName = getColorToVerifiedName(
    changes,
    leagueP1,
    leagueP2
  );
  if (colorToVerifiedName == null) {
    return null;
  }
  const playerToColors: PlayerToColors = {};
  Object.keys(colorToVerifiedName).forEach((color) => {
    playerToColors[colorToVerifiedName[color]] = [
      color as unknown as BingosyncColor,
    ];
  });
  return playerToColors;
}
