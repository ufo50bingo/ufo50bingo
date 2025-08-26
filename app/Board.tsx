import { Center } from "@mantine/core";
import SquareText from "./SquareText";
import classes from "./Board.module.css";
import { BingosyncColor, RawSquare } from "./matches/refreshMatch";
import { RefObject } from "react";

type Props = {
  rows: ReadonlyArray<RawSquare>;
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
  rows,
  onClickSquare,
  isHidden,
  setIsHidden,
  ref,
}: Props) {
  const getRow = (rowIndex: number) => (
    <tr style={{ height: "95px" }} key={rowIndex}>
      {rows.slice(rowIndex * 5, rowIndex * 5 + 5).map((square, squareIndex) => (
        <td
          key={squareIndex}
          className={`${classes.unselectable} ${classes.square} ${getColorClass(
            rows[rowIndex * 5 + squareIndex].colors
          )}`}
          onClick={() =>
            onClickSquare != null && onClickSquare(rowIndex * 5 + squareIndex)
          }
        >
          <Center h={85}>
            <SquareText text={square.name} />
          </Center>
        </td>
      ))}
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
