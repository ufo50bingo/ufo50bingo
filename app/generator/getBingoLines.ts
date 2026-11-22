import range from "./range";

type Return = {
  rowsAndCols: ReadonlyArray<ReadonlyArray<number>>;
  diagonals: ReadonlyArray<ReadonlyArray<number>>;
};
export default function getBingoLines(rows: number, cols: number): Return {
  const rowsAndCols: Array<Array<number>> = [];
  const diagonals: Array<Array<number>> = [];
  for (let r = 0; r < rows; r++) {
    rowsAndCols.push(range(cols).map((c) => r * cols + c));
  }
  for (let c = 0; c < cols; c++) {
    rowsAndCols.push(range(rows).map((r) => r * cols + c));
  }
  if (rows === cols) {
    diagonals.push(range(rows).map((i) => i * (rows + 1)));
    diagonals.push(range(rows).map((i) => (i + 1) * (rows - 1)));
  }
  return { rowsAndCols, diagonals };
}
