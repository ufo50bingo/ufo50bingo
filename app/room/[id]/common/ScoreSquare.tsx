import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import classes from "./ScoreSquare.module.css";
import boardClasses from "@/app/Board.module.css";

type Props = {
  color: BingosyncColor;
  score: number;
  hasTiebreaker: boolean;
  isDouble: boolean;
};

export default function ScoreSquare({ color, score, hasTiebreaker, isDouble }: Props) {
  return (
    <div className={`${classes.score} ${isDouble ? classes.double : classes.normal} ${getColorClass(color)}`}>
      {hasTiebreaker ? <u>{score}</u> : score}
    </div>
  );
}

function getColorClass(color: BingosyncColor): string {
  switch (color) {
    case "blank":
      return "";
    case "red":
      return boardClasses.redsquare;
    case "blue":
      return boardClasses.bluesquare;
    case "green":
      return boardClasses.greensquare;
    case "orange":
      return boardClasses.orangesquare;
    case "purple":
      return boardClasses.purplesquare;
    case "navy":
      return boardClasses.navysquare;
    case "teal":
      return boardClasses.tealsquare;
    case "pink":
      return boardClasses.pinksquare;
    case "brown":
      return boardClasses.brownsquare;
    case "yellow":
      return boardClasses.yellowsquare;
  }
}
