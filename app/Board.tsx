import { useState } from "react";
import { Center } from "@mantine/core";
import SquareText from "./SquareText";
import classes from "./Board.module.css";
import { RawSquare } from "./matches/refreshMatch";

type Props = {
  rows: ReadonlyArray<RawSquare>;
  onClickSquare: null | ((squareIndex: number) => void);
  isHidden: boolean;
  setIsHidden: (isHidden: boolean) => void;
};

export default function Board({
  rows,
  onClickSquare,
  isHidden,
  setIsHidden,
}: Props) {
  const getRow = (rowIndex: number) => (
    <tr style={{ height: "95px" }} key={rowIndex}>
      {rows.slice(rowIndex * 5, rowIndex * 5 + 5).map((square, squareIndex) => (
        <td
          key={squareIndex}
          className={
            rows[rowIndex * 5 + squareIndex].colors === "red"
              ? `${classes.unselectable} ${classes.square} ${classes.redsquare}`
              : `${classes.unselectable} ${classes.square} ${classes.blanksquare}`
          }
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
    <div className={classes.boardContainer}>
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
