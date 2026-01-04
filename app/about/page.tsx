import ufoGenerator from "../generator/ufoGenerator";
import { BingosyncColor } from "../matches/parseBingosyncData";
import { STANDARD_UFO } from "../pastas/standardUfo";
import About from "./About";

// generating board here to avoid hydration errors
const INITIAL_COLOR: BingosyncColor = "blank";
const BOARD = ufoGenerator(STANDARD_UFO).map((name) => ({
  name,
  color: INITIAL_COLOR,
}));

export default function AboutPage() {
  return <About initialBoard={BOARD} />;
}
