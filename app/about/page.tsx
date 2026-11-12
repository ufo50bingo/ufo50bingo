import { Metadata } from "next";
import ufoGenerator from "../generator/ufoGenerator";
import { STANDARD_UFO } from "../pastas/standardUfo";
import About from "./About";

export const metadata: Metadata = {
  title: "How to play UFO 50 Bingo",
  description: "Learn how to play UFO 50 Bingo!",
};

const BOARD = ufoGenerator(STANDARD_UFO, 5, 5).map((name) => ({
  name,
  color: null,
}));

export default function AboutPage() {
  return <About initialBoard={BOARD} />;
}
