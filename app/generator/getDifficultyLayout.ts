// given an array of difficulty counts such as [5, 7, 6, 2, 5] (representing
// 5 easy, 7 medium, 6 hard, 2 very hard, 5 general), lays the difficulties out
// on a board in a "good" layout
//
// For each difficulty, the "ideal count" on a line is just the overall
// proportion of that difficulty * the length of the line. So if there are 7
// mediums out of 25 total cells, the ideal count is 7/25 * 5 = 1.4 mediums per
// line.
//
// What we're trying to achieve:
// 1. Every line has floor(ideal) or ceil(ideal) of each difficulty. So for a 5x5
//    board with 7 mediums, the ideal count is 1.4, and every line will have
//    exactly 1 or 2 mediums
// 2. Over lots of boards, each cell's difficulty is distributed the same as the
//    board overall. So each cell is medium 7/25 of the time.
// 3. Over lots of boards, each line averages out to the ideal count of each
//    difficulty.
//
// The algorithm:
// 1. If the board is square, randomly pick the center's difficulty and the
//    exact counts each diagonal should have, with odds chosen so that they're
//    correct on average. We do not pick specific diagonal squares, just the
//    desired difficulty distribution.
// 2. Randomly fill out the board, then use simulated annealing to swap cells
//    until all rows/columns are within their ideal range, and diagonals are
//    exactly the counts we picked in step 1.
// 3. Randomly shuffle the rows and columns in a specific way so that the
//    composition of the lines does not change. Note that swapping two rows
//    leaves all row compositions the same (just renumbered) and all column
//    compositions the same (just reordering the items within a column).
//    However, only certain shuffles *also* preserve the diagonals. See below
//    for details.
//
// Without the choices from step 1, we may tend to generate boards where
// diagonals do not have the same expected difficulty distribution as
// rows/cols.
//
// The shuffling in step 3 makes sure that any cells which can be mapped to
// each other will have identical distributions.

import shuffle from "../createboard/shuffle";
import getBingoLines from "./getBingoLines";
import range from "./range";

export interface GetDifficultyLayoutOptions {
  // setting this allows you to bias the center square toward being a given difficulty.
  // If provided, the array length should match the length of the difficulties array.
  // Supplied weights are multiplied by difficultyCounts to get the final weights.
  // Only applies to square boards with an odd size
  centerWeights?: ReadonlyArray<number> | null;
  // how many times to run the search on one set of diagonal targets before giving up on them
  searchesPerTarget?: number;
  // how many sets of diagonal targets to try before settling for the best board we found
  maxTargetDraws?: number;
  // when searching, how many swaps are allowed per cell. Multiply by the total number
  // of cells to get the max number of iterations
  swapsPerCell?: number;
  // startTemp and endTemp are the "temperatures" for the search.
  // higher temperatures mean that we allow more bad swaps
  startTemp?: number;
  endTemp?: number;
}

export interface GetDifficultyLayoutResult {
  board: Array<number>;
  // 0 if every line is in range
  cost: number;
}

// a line, along with the allowed range for the count of each difficulty
type Line = {
  cells: ReadonlyArray<number>;
  min: ReadonlyArray<number>;
  max: ReadonlyArray<number>;
};

export function getDifficultyLayout(
  difficultyCounts: ReadonlyArray<number>,
  rows: number,
  cols: number,
  options: GetDifficultyLayoutOptions = {},
): GetDifficultyLayoutResult {
  const {
    centerWeights = null,
    searchesPerTarget = 20,
    maxTargetDraws = 20,
  } = options;
  const cellCount = rows * cols;
  if (difficultyCounts.reduce((a, b) => a + b, 0) !== cellCount) {
    throw new Error("difficultyCounts must sum to rows * cols");
  }
  if (
    centerWeights != null &&
    centerWeights.length !== difficultyCounts.length
  ) {
    throw new Error(
      "centerWeights must have the same length as difficultyCounts",
    );
  }

  const isSquare = rows === cols;
  const centerIdx = isSquare && rows % 2 === 1 ? (cellCount - 1) / 2 : null;
  const bingoLines = getBingoLines(rows, cols);
  const lineCells = bingoLines.rowsAndCols.concat(bingoLines.diagonals);
  const isDiagonal = (lineIdx: number) => lineIdx >= rows + cols;

  let best: { board: Array<number>; cost: number } | null = null;
  for (let draw = 0; draw < maxTargetDraws; draw++) {
    // we only allow fixing the center for now, but it's generic just in case
    // we add more later
    const fixedCells = new Map<number, number>();
    let centerDifficulty: number | null = null;
    if (centerIdx != null) {
      centerDifficulty = pickWeighted(
        difficultyCounts.map(
          (count, difficulty) => count * (centerWeights?.[difficulty] ?? 1),
        ),
      );
      fixedCells.set(centerIdx, centerDifficulty);
    }

    // diagonals have exact targets, everything else can be floor or ceil
    const lines: Array<Line> = lineCells.map((cells, lineIdx) => {
      if (isDiagonal(lineIdx)) {
        const target = drawTargets(
          difficultyCounts,
          cells.length,
          centerDifficulty,
        );
        return { cells, min: target, max: target };
      }
      return {
        cells,
        min: difficultyCounts.map((count) =>
          Math.floor((count * cells.length) / cellCount),
        ),
        max: difficultyCounts.map((count) =>
          Math.ceil((count * cells.length) / cellCount),
        ),
      };
    });

    for (let attempt = 0; attempt < searchesPerTarget; attempt++) {
      const result = search(difficultyCounts, lines, fixedCells, options);
      if (best == null || result.cost < best.cost) {
        best = result;
      }
      if (result.cost === 0) {
        return {
          board: applyRandomSymmetry(result.board, rows, cols),
          cost: 0,
        };
      }
    }
  }

  // sometimes it may be impossible to get a perfect result. For example, a 3x3
  // boad with 3 difficulties that each have 3 cells cannot be laid out according
  // to our desired spec, because that's equivalent to finding a 3x3 diagonal
  // latin square. See
  // https://oeis.org/A274171
  return {
    board: applyRandomSymmetry(best!.board, rows, cols),
    cost: best!.cost,
  };
}

// randomly picks how many of each difficulty a diagonal line should have.
// Each cound must be either floor(ideal) or ceil(ideal), and we choose
// ceil with probability of ideal - floor(ideal) to make the distribution
// equal the ideal distribution.
//
// To do this, we line up the fractional parts end to end (in random order),
// pick a random starting offset, and put a mark at the offset and every whole
// number after it. A difficulty rounds up if a mark lands in its section.
// Each section is shorter than 1, so it gets at most 1 mark, and the chance of
// getting a mark is the length of the section. Everything is multiplied by
// the total number of cells so we can use integers and avoid rounding errors.
//
// If containsDifficulty is set, the line goes through the center, which has
// already been picked as that difficulty. So the targets need at least one of
// it (e.g. if the center is very hard, the diagonal needs a very hard). In
// that case, we pick targets with probability proportional to their count of
// that difficulty. That's the same as drawing the line's targets first and
// then picking the center out of the line, so the targets are still correct
// on average. To do that, we keep drawing until a draw "passes", which
// happens with probability
// (count of containsDifficulty / max possible count of containsDifficulty).
function drawTargets(
  difficultyCounts: ReadonlyArray<number>,
  lineLength: number,
  containsDifficulty: number | null,
): Array<number> {
  const cellCount = difficultyCounts.reduce((a, b) => a + b, 0);
  for (;;) {
    const targets = difficultyCounts.map((difficultyCOunt) =>
      Math.floor((difficultyCOunt * lineLength) / cellCount),
    );
    // fractional parts of the ideals, multiplied by cellCount
    const fractions = difficultyCounts.map(
      (count) => (count * lineLength) % cellCount,
    );
    let position = Math.random() * cellCount;
    for (const difficulty of shuffled(range(difficultyCounts.length))) {
      const marksBefore = Math.floor(position / cellCount);
      position += fractions[difficulty];
      if (Math.floor(position / cellCount) > marksBefore) {
        targets[difficulty]++;
      }
    }

    if (containsDifficulty == null) {
      return targets;
    }
    const maxPossible = Math.ceil(
      (difficultyCounts[containsDifficulty] * lineLength) / cellCount,
    );
    if (Math.random() * maxPossible < targets[containsDifficulty]) {
      return targets;
    }
  }
}

// Tries to find a board where every line's counts are within its min/max using
// Simulated Annealing: https://en.wikipedia.org/wiki/Simulated_annealing
//
// The cost is a simple sum of how far each line is outside its allowed
// range. We randomly fill out the board (except for fixed cells, i.e. the
// // center), and then repeat this many times:
// * pick two random squares
// * if swapping them doesn't raise the cost, swap them
// * else, swap them anyways with a probability based on the "temperature"
//   and how much the cost would go up
// The temperature drops as we go, so we allow fewer and fewer "bad" swaps.
// Bad swaps help keep us from getting stuck.
function search(
  difficultyCounts: ReadonlyArray<number>,
  lines: ReadonlyArray<Line>,
  fixedCells: ReadonlyMap<number, number>,
  options: GetDifficultyLayoutOptions,
): { board: Array<number>; cost: number } {
  const { swapsPerCell = 200, startTemp = 1, endTemp = 0.05 } = options;

  const numDifficulties = difficultyCounts.length;
  const cellCount = difficultyCounts.reduce((a, b) => a + b, 0);
  const iterations = swapsPerCell * cellCount;

  // lines that each cell is a member of, by index in the lines array
  const cellLines: Array<Array<number>> = range(cellCount).map(() => []);
  lines.forEach((line, lineIdx) =>
    line.cells.forEach((cellIdx) => cellLines[cellIdx].push(lineIdx)),
  );

  // randomly fill in the board, leaving fixed cells alone
  const board = new Array<number>(cellCount);
  const remainingCounts = [...difficultyCounts];
  fixedCells.forEach((difficulty, cellIdx) => {
    board[cellIdx] = difficulty;
    remainingCounts[difficulty]--;
  });
  const movable = range(cellCount).filter(
    (cellIdx) => !fixedCells.has(cellIdx),
  );
  const difficultiesToPlace = shuffled(
    remainingCounts.flatMap((count, difficulty) =>
      Array(count).fill(difficulty),
    ),
  );
  movable.forEach(
    (cellIdx, indexInMovable) =>
      (board[cellIdx] = difficultiesToPlace[indexInMovable]),
  );

  // # of cells for line L with difficulty D is at lineCounts[L][D]
  const lineCounts = lines.map(() =>
    new Array<number>(numDifficulties).fill(0),
  );
  lines.forEach((line, lineIdx) =>
    line.cells.forEach((cellIdx) => lineCounts[lineIdx][board[cellIdx]]++),
  );

  // how far outside of the allowed range a count is
  const getCost = (lineIdx: number, difficulty: number): number => {
    const count = lineCounts[lineIdx][difficulty];
    const { min, max } = lines[lineIdx];
    return Math.max(0, min[difficulty] - count, count - max[difficulty]);
  };

  // adds or removes one cell of a difficulty on a line and returns the cost change
  const bump = (lineIdx: number, difficulty: number, dir: 1 | -1): number => {
    const oldCost = getCost(lineIdx, difficulty);
    lineCounts[lineIdx][difficulty] += dir;
    return getCost(lineIdx, difficulty) - oldCost;
  };

  // swap cells i and j and return the cost change
  const swap = (i: number, j: number): number => {
    const iDifficulty = board[i];
    const jDifficulty = board[j];
    let delta = 0;
    for (const lineIdx of cellLines[i]) {
      delta += bump(lineIdx, iDifficulty, -1);
      delta += bump(lineIdx, jDifficulty, 1);
    }
    for (const lineIdx of cellLines[j]) {
      delta += bump(lineIdx, jDifficulty, -1);
      delta += bump(lineIdx, iDifficulty, 1);
    }
    board[i] = jDifficulty;
    board[j] = iDifficulty;
    return delta;
  };

  let cost = 0;
  lines.forEach((_, lineIdx) => {
    for (let difficulty = 0; difficulty < numDifficulties; difficulty++) {
      cost += getCost(lineIdx, difficulty);
    }
  });

  let bestBoard = [...board];
  let bestCost = cost;
  for (let it = 0; it < iterations && cost > 0; it++) {
    // lower temperature more and more as we iterate
    const temp = startTemp * Math.pow(endTemp / startTemp, it / iterations);
    const i = movable[Math.floor(Math.random() * movable.length)];
    const j = movable[Math.floor(Math.random() * movable.length)];
    if (board[i] === board[j]) {
      continue;
    }
    const delta = swap(i, j);
    if (delta <= 0 || Math.random() < Math.exp(-delta / temp)) {
      cost += delta;
      if (cost < bestCost) {
        bestBoard = [...board];
        bestCost = cost;
      }
    } else {
      // if we reject the swap, undo it
      swap(i, j);
    }
  }
  return { board: bestBoard, cost: bestCost };
}

// Shuffles the rows and columns of the board so that diagonal compositions
// are not changed.
//
// For non-square boards, we can just shuffle the rows and columns.
//
// For square boards, the trick is to pair rows and columns by symmetry around
// the center lines of the board. So on a 5x5 board, row 0 is paired with row 4,
// col 1 is paired with col 3. For odd size boards, the middle row has no pair
// and is not moved.
//
// We randomly choose a permutation so that rows are still paired with the
// correct partner when reflected across the center line. For example, the ONLY
// valid permutations for a 5x5 board are
// 01234 03214 10243 14203 30241 34201 41230 43210
//
// We then apply either that exact same permutation or its mirror image to the
// columns as well. So if we applied the permutation 03214 to the rows, we could
// apply either 03214 or 41230 to the columns.
//
// If you apply the exact same permutation to the rows and columns, then any
// cell (i,i) on the main diagonal will still be on the main diagonal, since it gets
// sent to (p(i), p(i)). A cell on the other diagonal (i, N - i - 1) will be sent to
// // (p(i), p(N - i - 1)). But because of the mirroring property of the permutation,
// we know that p(N - i - 1) = N - p(i) - 1, so the new cell is on the same diagonal.
//
// Mirroring the entire board after applying that permutation just swaps the positions
// of the two diagonals, so that is allowed as well. That's why applying 03214 to rows
// and 41230 to columns is ok.
//
// Finally, we may randomply transpose the board, because row/col composition must
// already be the same and it doesn't change diagonal composition.
function applyRandomSymmetry(
  board: ReadonlyArray<number>,
  rows: number,
  cols: number,
): Array<number> {
  let rowPerm: Array<number>;
  let colPerm: Array<number>;
  let transpose = false;
  if (rows !== cols) {
    rowPerm = shuffled(range(rows));
    colPerm = shuffled(range(cols));
  } else {
    const size = rows;
    rowPerm = range(size);
    const pairOrder = shuffled(range(Math.floor(size / 2)));
    pairOrder.forEach((oldPair, newPair) => {
      const flip = Math.random() < 0.5;
      rowPerm[newPair] = flip ? size - 1 - oldPair : oldPair;
      rowPerm[size - 1 - newPair] = size - 1 - rowPerm[newPair];
    });
    colPerm =
      Math.random() < 0.5
        ? rowPerm
        : rowPerm.map((original) => size - 1 - original);
    transpose = Math.random() < 0.5;
  }

  const result = new Array<number>(rows * cols);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const difficulty = board[rowPerm[r] * cols + colPerm[c]];
      // assumes square board
      result[transpose ? c * cols + r : r * cols + c] = difficulty;
    }
  }
  return result;
}

function pickWeighted(weights: ReadonlyArray<number>): number {
  const total = weights.reduce((acc, val) => acc + Math.max(0, val), 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= Math.max(0, weights[i]);
    if (r < 0) {
      return i;
    }
  }
  return weights.length - 1;
}

function shuffled<T>(array: Array<T>): Array<T> {
  shuffle(array);
  return array;
}
