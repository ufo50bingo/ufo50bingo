import { BingosyncColor } from "@/app/color";
import { FeedColorMark } from "@/app/fetchFeed";
import getBingoLines from "@/app/generator/getBingoLines";

export interface BoardStateParams {
  rows: number;
  cols: number;
  isLockout: boolean;
}

export default class BoardState {
  rows: number;
  cols: number;
  isLockout: boolean;
  squares: Array<Set<BingosyncColor>>;
  lines: ReadonlyArray<ReadonlyArray<number>>;

  constructor({ rows, cols, isLockout }: BoardStateParams) {
    this.rows = rows;
    this.cols = cols;
    this.isLockout = isLockout;
    const allLines = getBingoLines(rows, cols);
    this.lines = allLines.rowsAndCols.concat(allLines.diagonals);
    this.squares = Array(rows * cols)
      .fill(null)
      .map((_) => new Set());
  }

  // if change is illegal or redundant, return false
  apply(item: FeedColorMark): boolean {
    const colors = this.squares[item.squareIndex];
    if (item.isClear) {
      return colors.delete(item.color);
    }
    if (colors.has(item.color) || (this.isLockout && colors.size > 0)) {
      return false;
    }
    colors.add(item.color);
    return true;
  }

  hasColor(squareIndex: number, color: BingosyncColor): boolean {
    return this.squares[squareIndex].has(color);
  }

  hasBingo(color: BingosyncColor): boolean {
    return this.lines.some((line) =>
      line.every((i) => this.squares[i].has(color)),
    );
  }

  getScores(): Map<BingosyncColor, number> {
    const scores = new Map<BingosyncColor, number>();
    for (const colors of this.squares) {
      for (const color of colors) {
        scores.set(color, (scores.get(color) ?? 0) + 1);
      }
    }
    return scores;
  }
}
