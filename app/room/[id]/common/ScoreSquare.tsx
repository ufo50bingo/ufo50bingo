import classes from "./ScoreSquare.module.css";
import { Font } from "@/app/font/useFont";
import getFontClassname from "@/app/font/getFontClassname";
import { BingosyncColor, getColorSquareClass } from "@/app/color";

type Props = {
  color: BingosyncColor;
  score: number;
  hasTiebreaker: boolean;
  isDouble: boolean;
  font: Font;
};

export default function ScoreSquare({
  color,
  score,
  hasTiebreaker,
  isDouble,
  font,
}: Props) {
  return (
    <div
      className={`${classes.score} ${isDouble ? classes.double : classes.normal} ${getColorSquareClass(color)}`}
    >
      <span className={getFontClassname(font, !isDouble)}>
        {hasTiebreaker ? <u>{score}</u> : score}
      </span>
    </div>
  );
}
