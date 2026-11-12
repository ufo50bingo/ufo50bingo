// TODO: Get rid of all of this
import { SequenceMatcher } from "difflib";
import {
  TBoard,
  Change,
  Changelog,
  PlayerToColors,
} from "./parseBingosyncData";
import { ALIASES } from "../createboard/leagueConstants";
import { BingosyncColor } from "../color";

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
  changes: ReadonlyArray<Change>,
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
  changes: ReadonlyArray<Change>,
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
  playerColors: ReadonlyArray<BingosyncColor>,
): boolean {
  return BINGO_LINES[lineIndex].every((squareIndex) =>
    playerColors.includes(boardColors[squareIndex]),
  );
}

type BingoLine = {
  player: string;
  lineIndex: number;
};
function getBingoLines(
  boardColors: ReadonlyArray<BingosyncColor>,
  players: PlayerToColors,
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
  players: PlayerToColors,
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
            currentLine.player === line.player,
        ) != null,
    );
    // add new lines that weren't present previously
    curBingoLines.forEach((curLine) => {
      if (
        newLines.find(
          (prevLine) =>
            prevLine.lineIndex === curLine.lineIndex &&
            prevLine.player === curLine.player,
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
  _changes: ReadonlyArray<Change>,
  _players: PlayerToColors,
): string {
  return "Dead code";
}

export function getMatchStartTime(
  changelog: Changelog,
  analysisSeconds: number,
): null | number {
  const revealTime = changelog.reveals?.[0]?.time;
  return revealTime == null ? null : revealTime + analysisSeconds;
}

export function getSquareCompletionRanges(
  _matchStartTime: null | number,
  _changesWithoutMistakes: ReadonlyArray<Change>,
): ReadonlyArray<[string, number, number] | null> {
  // Dead code
  return [];
}

function getChangesWithoutDuplicates(
  changes: ReadonlyArray<Change>,
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
  changes: ReadonlyArray<Change>,
): ReadonlyArray<Change> {
  const withouDuplicates = getChangesWithoutDuplicates(changes);
  const changesBySquare: Change[][] = Array(25)
    .fill(null)
    .map((_) => []);
  withouDuplicates.forEach((change) => {
    changesBySquare[change.index].push(change);
  });
  changesBySquare.forEach((changesForSquare) =>
    removeMistakesForSquare(changesForSquare),
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
    playerToNetAdditiosn[a] > playerToNetAdditiosn[b] ? a : b,
  );
}

function getSimilarity(verifiedName: string, name: string): number {
  const aliases = ALIASES[verifiedName] ?? [];
  const allNames = [verifiedName, ...aliases];
  const allScores = allNames.map((verifiedOrAlias) =>
    new SequenceMatcher(null, verifiedOrAlias, name).ratio(),
  );
  return Math.max(...allScores);
}

export function getColorToVerifiedName(
  _changes: ReadonlyArray<Change>,
  _verifiedP1: string,
  _verifiedP2: string,
): null | {
  [color: string]: string;
} {
  // Dead code
  return null;
}

export function getVerifiedPlayerToColors(
  changes: ReadonlyArray<Change>,
  leagueP1: string | null | undefined,
  leagueP2: string | null | undefined,
): null | PlayerToColors {
  if (leagueP1 == null || leagueP2 == null) {
    return null;
  }
  const colorToVerifiedName = getColorToVerifiedName(
    changes,
    leagueP1,
    leagueP2,
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
