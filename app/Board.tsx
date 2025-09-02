import { Center } from "@mantine/core";
import SquareText from "./SquareText";
import classes from "./Board.module.css";
import { ReactNode, RefObject } from "react";
import { BingosyncColor, TBoard } from "./matches/parseBingosyncData";

type Props = {
  board: TBoard;
  overlays?: ReadonlyArray<null | ReactNode>;
  onClickSquare: null | ((squareIndex: number) => void);
  isHidden: boolean;
  setIsHidden: (isHidden: boolean) => void;
  hiddenText?: ReactNode;
};

function getColorClass(color: string): string {
  const firstColor = color.split(" ")[0] as BingosyncColor;

  switch (firstColor) {
    case "blank":
      return classes.blanksquare;
    case "red":
      return classes.redsquare;
    case "blue":
      return classes.bluesquare;
    case "green":
      return classes.greensquare;
    case "orange":
      return classes.orangesquare;
    case "purple":
      return classes.purplesquare;
    case "navy":
      return classes.navysquare;
    case "teal":
      return classes.tealsquare;
    case "pink":
      return classes.pinksquare;
    case "brown":
      return classes.brownsquare;
    case "yellow":
      return classes.yellowsquare;
  }
}

export default function Board({
  board,
  overlays,
  onClickSquare,
  isHidden,
  setIsHidden,
  hiddenText,
}: Props) {
  return (
    <div className={classes.boardContainer}>
      {board.map((square, squareIndex) => (
        <div
          key={squareIndex}
          className={`${classes.unselectable} ${classes.square} ${getColorClass(
            board[squareIndex].color
          )}`}
          onClick={() => onClickSquare != null && onClickSquare(squareIndex)}
        >
          {overlays != null && overlays[squareIndex] != null && (
            <div className={classes.overlay}>{overlays[squareIndex]}</div>
          )}
          <Center h={85}>
            <SquareText text={square.name} />
          </Center>
        </div>
      ))}
      {isHidden && (
        <div
          className={`${classes.boardCover} ${classes.unselectable}`}
          onClick={() => setIsHidden(false)}
        >
          {hiddenText ?? <span>Click to Reveal</span>}
        </div>
      )}
    </div>
  );
}
