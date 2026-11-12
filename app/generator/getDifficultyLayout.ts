// given an array of difficulty counts such as [5, 7, 6, 2, 5] (representing
// 5 easy, 7 medium, 6 hard, 2 very hard, 6 general), attempts to distribute
// the difficulties onto a board so that each row/col/diagonal has the same
// distribution of goals (or as close as possible).
//
// For each difficulty, the "ideal count" on a line is just total proportion
// of that difficulty / size of the line. So if there are 7 mediums out of 25
// total cells, the ideal cound is 7/25 * 5 = 1.4 mediums per line.
//
// The Cost of a line is summed per difficulty, (actual count - ideal count)^2
//
// The final board is found using Simulated Annealing:
// https://en.wikipedia.org/wiki/Simulated_annealing
//
// Essentailly, we just randomly fill out the board and then do this a ton of times
// * pick two random squares
// * if swapping them lowers the cost, swap them
// * else, check if swapping them raises the cost within the "temperature threshold"
//   and swap them if so
// We run through the whole process a number of times, then report the best board
// ever found.
//
// "temperature" is a concept from the wiki where as iterations increase, we allow
// fewer and fewer "bad" swaps.

import shuffle from "../createboard/shuffle";

const TOLERANCE = 1e-9;

export interface GetDifficultyLayoutOptions {
  // setting this allows you to bias the center square toward being a given difficulty
  // if provided, the array length should match the length of the difficulties array.
  // Supplied weights are multiplied by difficultyCounts to get the final weights
  centerWeights?: ReadonlyArray<number> | null;
  // if provided, the algorithm will not terminate until this lower bound is reached.
  // You must ensure that the lower bound is actually possible before supplying this
  costTarget?: number | null;
  // max restarts allowed
  restarts?: number;
  // max iterations per cell. The final number of iterations is this * number of cells
  iterationsPerCell?: number;
  // temperatures. See wikipedia article linked above
  startTemp?: number;
  endTemp?: number;
}

export interface GetDifficultyLayoutResult {
  board: Array<number>;
  cost: number;
  restartsUsed: number;
}

export function getDifficultyLayout(
  difficultyCounts: ReadonlyArray<number>,
  rows: number,
  cols: number,
  options: GetDifficultyLayoutOptions,
): GetDifficultyLayoutResult {
  const {
    centerWeights = null,
    costTarget = null,
    restarts = 20,
    iterationsPerCell = 100,
    startTemp = 0.6,
    endTemp = 0.03,
  } = options;

  const cellCount = rows * cols;
  const iterationsPerRun = cellCount * iterationsPerCell;
  const numDifficulties = difficultyCounts.length;
  if (difficultyCounts.reduce((a, b) => a + b, 0) !== cellCount) {
    throw new Error("difficultyCounts must sum to rows * cols");
  }

  if (centerWeights != null && centerWeights.length !== numDifficulties) {
    throw new Error(
      "centerWeights must have the same length as difficultyCounts",
    );
  }

  // all lines to check costs on. Indices are in reading order,
  // so row r col c is at index r*cols + c
  const lines: Array<Array<number>> = [];
  for (let r = 0; r < rows; r++) {
    lines.push(range(cols).map((c) => r * cols + c));
  }
  for (let c = 0; c < cols; c++) {
    lines.push(range(rows).map((r) => r * cols + c));
  }
  if (rows === cols) {
    lines.push(range(rows).map((i) => i * cols + i));
    lines.push(range(rows).map((i) => i * cols + (cols - 1 - i)));
  }
  const lineCount = lines.length;

  // lines that each cell is a member of. Lines are defined by their index
  // in the lines array
  const cellLines: Array<Array<number>> = Array(cellCount)
    .fill(null)
    .map((_) => []);
  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    for (const cell of lines[lineIdx]) {
      cellLines[cell].push(lineIdx);
    }
  }

  // ideal is an array of floats, with one entry for each difficulty on
  // on each line. The target for line L difficulty D is at L*(num difficulties) + D
  // Float64Array is slightly more efficient and accurate than Array<number>
  const ideal = new Float64Array(lineCount * numDifficulties);
  // lowerBound is the best possible cost we can get with only integer counts,
  // since if the target is a non-integer it's never possible to get 0 cost.
  // lowerBound is not guaranteed to be achievable
  let lowerBound = 0;
  lines.forEach((line, lineIdx) => {
    const idealsForLine = difficultyCounts.map(
      (dCount) => (dCount * line.length) / cellCount,
    );
    // fill in the overall ideal array
    idealsForLine.forEach(
      (target, difficulty) =>
        (ideal[lineIdx * numDifficulties + difficulty] = target),
    );
    // start by flooring, then we'll add on remainders later
    const roundedIdealCountsForLine = idealsForLine.map(Math.floor);
    const remainder =
      line.length -
      roundedIdealCountsForLine.reduce((acc, val) => acc + val, 0);
    // sort difficulties by how large their remainders are after flooring
    const byRemainder = idealsForLine
      .map((target, difficulty) => ({
        difficulty,
        remainder: target - Math.floor(target),
      }))
      .sort((a, b) => b.remainder - a.remainder);
    for (let r = 0; r < remainder; r++) {
      roundedIdealCountsForLine[byRemainder[r].difficulty]++;
    }
    // update the lower bound with the best possible cost of this line
    lowerBound += roundedIdealCountsForLine.reduce(
      (acc, target, difficulty) =>
        acc + (target - idealsForLine[difficulty]) ** 2,
      0,
    );
  });

  if (costTarget != null) {
    if (lowerBound > costTarget) {
      throw new Error(
        "Invalid costTarget supplied! It is lower than the lowest possible value",
      );
    }
    lowerBound = costTarget;
  }

  let centerInfo: null | { idx: number; difficulty: number } = null;
  if (centerWeights != null && rows === cols && rows % 2 === 1) {
    const difficulty = pickWeighted(
      difficultyCounts.map((overallCount, difficulty) =>
        overallCount > 0
          ? centerWeights[difficulty] * difficultyCounts[difficulty]
          : 0,
      ),
    );
    centerInfo = { idx: (cellCount - 1) / 2, difficulty };
  }
  // if center difficulty distribution was given, don't allow moving the center
  const movable = range(cellCount).filter(
    (c) => centerInfo == null || c !== centerInfo.idx,
  );

  const board = new Array<number>(cellCount);
  // as before, # of cells for line L with difficulty D is at L*(num difficulties) + D
  const lineCounts = new Int32Array(lineCount * numDifficulties);
  let cost = 0;

  // adds or removes one "difficulty count" on a line and returns the cost change
  // NOTE: A single call may leave the line with an incorrect sum. Should
  // only be called consecutively with both a +1 and a -1
  const bump = (lineIdx: number, difficulty: number, dir: 1 | -1): number => {
    const idx = lineIdx * numDifficulties + difficulty;
    const diff = lineCounts[idx] - ideal[idx];
    lineCounts[idx] += dir;
    // the old cost was (old - target)^2
    // the new cost is ((old + 1) - target)^2
    // = (old + 1)^2 - 2*(old + 1)*target + target^2
    // = old^2 + 2*old + 1 - 2*old*target - 2*target + target^2
    // = (old^2 - 2*old*target + target^2) + 2*old + 1 - 2*target
    // = old cost + 2*(old - target) + 1
    // = old cost + 2*diff + 1
    // You get -2 if you do the same calculation with old - 1 instead of old + 1
    return dir * 2 * diff + 1;
  };

  // swap cells i and j and return the cost change
  const swap = (i: number, j: number): number => {
    const iDifficulty = board[i];
    const jDifficulty = board[j];
    let delta = 0;
    for (const lineIndex of cellLines[i]) {
      delta += bump(lineIndex, iDifficulty, -1);
      delta += bump(lineIndex, jDifficulty, 1);
    }
    for (const lineIndex of cellLines[j]) {
      delta += bump(lineIndex, jDifficulty, -1);
      delta += bump(lineIndex, iDifficulty, 1);
    }
    board[i] = jDifficulty;
    board[j] = iDifficulty;
    return delta;
  };

  // randomly fills in board (possibly with the fixed center square)
  // then sets up lineCounts and cost
  const initialize = () => {
    const difficultiesToPlace: Array<number> = [];
    difficultyCounts.forEach((difficultyCount, difficulty) => {
      const remaining =
        centerInfo != null && difficulty === centerInfo.difficulty
          ? difficultyCount - 1
          : difficultyCount;
      for (let i = 0; i < remaining; i++) {
        difficultiesToPlace.push(difficulty);
      }
    });
    // fill the squares (possibly excluding the center) randomly
    shuffle(difficultiesToPlace);
    movable.forEach(
      (cellIndex, indexInMovable) =>
        (board[cellIndex] = difficultiesToPlace[indexInMovable]),
    );
    if (centerInfo != null) {
      board[centerInfo.idx] = centerInfo.difficulty;
    }

    lineCounts.fill(0);
    lines.forEach((line, lineIdx) =>
      line.forEach((cellIdx) => {
        const difficulty = board[cellIdx];
        lineCounts[lineIdx * numDifficulties + difficulty]++;
      }),
    );
    cost = 0;
    for (let i = 0; i < lineCounts.length; i++) {
      cost += (lineCounts[i] - ideal[i]) ** 2;
    }
  };

  let bestBoard: Array<number> = [];
  let bestCost = Infinity;
  for (let run = 0; run < restarts; run++) {
    initialize();

    // Sets bestCost and bestBoard after the first initialization.
    // It's technically possible that the random assignment is amazing,
    // so check just in case.
    if (cost < bestCost) {
      bestCost = cost;
      bestBoard = [...board];
    }
    if (bestCost <= lowerBound + TOLERANCE) {
      return { board: bestBoard, cost: bestCost, restartsUsed: run };
    }

    for (let it = 0; it < iterationsPerRun; it++) {
      // lower temperature more and more as we iterate
      const temp =
        startTemp * Math.pow(endTemp / startTemp, it / iterationsPerRun);
      const i = movable[Math.floor(Math.random() * movable.length)];
      const j = movable[Math.floor(Math.random() * movable.length)];
      if (board[i] === board[j]) {
        continue;
      }

      const delta = swap(i, j);
      // if the swap improves the cost, always accept it
      // if the swap does not improve the cost, temp allows us to
      // do it sometimes. High temp means we allow bad swaps more often
      if (delta <= 0 || Math.random() < Math.exp(-delta / temp)) {
        cost += delta;
        if (cost < bestCost) {
          bestCost = cost;
          bestBoard = [...board];
          if (bestCost <= lowerBound + TOLERANCE) {
            return { board: bestBoard, cost: bestCost, restartsUsed: run };
          }
        }
      } else {
        // if we reject the swap, undo it
        swap(i, j);
      }
    }
  }

  // failed to find a board with cost equal to lowerBound, so report the best one found
  return { board: bestBoard, cost: bestCost, restartsUsed: restarts - 1 };
}

function pickWeighted(weights: ReadonlyArray<number>): number {
  const total = weights.reduce((acc, val) => acc + val, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= Math.max(0, weights[i]);
    if (r < 0) {
      return i;
    }
  }
  return weights.length - 1;
}

function range(n: number): Array<number> {
  return Array(n)
    .fill(null)
    .map((_, idx) => idx);
}
