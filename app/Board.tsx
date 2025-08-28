import { Badge, Center } from "@mantine/core";
import SquareText from "./SquareText";
import classes from "./Board.module.css";
import { ReactNode, RefObject } from "react";
import { BingosyncColor, Board as TBoard } from "./matches/parseBingosyncData";

type Props = {
  board: TBoard;
  overlays?: ReadonlyArray<null | ReactNode>;
  onClickSquare: null | ((squareIndex: number) => void);
  isHidden: boolean;
  setIsHidden: (isHidden: boolean) => void;
  ref?: RefObject<HTMLDivElement | null>;
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
  ref,
}: Props) {
  const getRow = (rowIndex: number) => (
    <tr style={{ height: "95px" }} key={rowIndex}>
      {board.slice(rowIndex * 5, rowIndex * 5 + 5).map((square, colIndex) => {
        const squareIndex = rowIndex * 5 + colIndex;
        return (
          <td
            key={colIndex}
            className={`${classes.unselectable} ${
              classes.square
            } ${getColorClass(board[squareIndex].color)}`}
            onClick={() => onClickSquare != null && onClickSquare(squareIndex)}
          >
            {overlays != null && overlays[squareIndex] != null && (
              <div className={classes.overlay}>{overlays[squareIndex]}</div>
            )}
            <Center h={85}>
              <SquareText text={square.name} />
            </Center>
          </td>
        );
      })}
    </tr>
  );
  return (
    <div className={classes.boardContainer} ref={ref}>
      <table className={classes.baseTable}>
        <colgroup>
          <col style={{ width: "105px" }} />
          <col style={{ width: "105px" }} />
          <col style={{ width: "105px" }} />
          <col style={{ width: "105px" }} />
          <col style={{ width: "105px" }} />
        </colgroup>
        <tbody>
          {getRow(0)}
          {getRow(1)}
          {getRow(2)}
          {getRow(3)}
          {getRow(4)}
        </tbody>
      </table>
      {isHidden && (
        <div
          className={`${classes.boardCover} ${classes.unselectable}`}
          onClick={() => setIsHidden(false)}
        >
          <span>Click to Reveal</span>
        </div>
      )}
    </div>
  );
}
