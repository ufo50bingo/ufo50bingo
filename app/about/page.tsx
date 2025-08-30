import { BingosyncColor } from "../matches/parseBingosyncData";
import { STANDARD } from "../pastas/standard";
import About from "./About";

const MAGIC_SQUARE: ReadonlyArray<number> = [
  // row 1
  17, 24, 1, 8, 15,
  // row 2
  23, 5, 7, 14, 16,
  // row 3
  4, 6, 13, 20, 22,
  // row 4
  10, 12, 19, 21, 3,
  // row 5
  11, 18, 25, 2, 9,
];

// generating board here to avoid hydration errors
const INITIAL_COLOR: BingosyncColor = "blank";
const BOARD = MAGIC_SQUARE.map((indexPlusOne) => {
  const group = STANDARD[indexPlusOne - 1];
  const goal = group[Math.floor(Math.random() * group.length)].name;
  return {
    name: goal,
    color: INITIAL_COLOR,
  };
});

export default function AboutPage() {
  return <About initialBoard={BOARD} />;
}
