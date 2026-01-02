import SquareText from "./SquareText";
import classes from "./Board.module.css";
import { CSSProperties, ReactNode, useState } from "react";
import { BingosyncColor, TBoard } from "./matches/parseBingosyncData";
import { Difficulty } from "./goals";
import getColorHex from "./room/[id]/cast/getColorHex";
import findGoal from "./findGoal";
import { STANDARD_UFO } from "./pastas/standardUfo";
import { SPICY_UFO } from "./pastas/spicyUfo";

type Props = {
  board: TBoard;
  overlays?: ReadonlyArray<null | ReactNode>;
  highlights?: ReadonlyArray<null | ReadonlyArray<BingosyncColor>>;
  onClickSquare: null | ((squareIndex: number) => void);
  isHidden: boolean;
  setIsHidden: (isHidden: boolean) => void;
  pauseRequestName?: null | string;
  clearPauseRequest?: () => void;
  hiddenText?: ReactNode;
  shownDifficulties: ReadonlyArray<Difficulty>;
  onReveal?: () => unknown;
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

function getDifficulty(
  name: string,
  shownDifficulties: ReadonlyArray<Difficulty>
): null | ReactNode {
  const result = findGoal(name, STANDARD_UFO) ?? findGoal(name, SPICY_UFO);
  if (result == null) {
    return null;
  }
  const difficulty = result.category;
  if (!shownDifficulties.includes(difficulty as Difficulty)) {
    return null;
  }
  let difficultyClass;
  let letter;
  switch (difficulty) {
    case "easy":
      difficultyClass = classes.easy;
      letter = "E";
      break;
    case "medium":
      difficultyClass = classes.medium;
      letter = "M";
      break;
    case "hard":
      difficultyClass = classes.hard;
      letter = "H";
      break;
    case "veryhard":
      difficultyClass = classes.veryhard;
      letter = "V";
      break;
    case "general":
      difficultyClass = classes.general;
      letter = "G";
      break;
    default:
      return null;
  }
  return (
    <>
      <div className={`${classes.difficulty} ${difficultyClass}`} />
      <div className={classes.difficultyBorder} />
      <div className={classes.difficultyLetter}>{letter}</div>
    </>
  );
}

function getBorderStyles(
  colors: null | undefined | ReadonlyArray<BingosyncColor>
): undefined | CSSProperties {
  if (colors == null || colors.length < 1) {
    return undefined;
  }
  const topAndLeft = getColorHex(colors[0]);
  const bottomAndRight =
    colors.length > 1 ? getColorHex(colors[1]) : getColorHex(colors[0]);

  const boxShadow = `inset 10px 0 10px -10px ${topAndLeft}, inset 0 10px 10px -10px ${topAndLeft}, inset -10px 0 10px -10px ${bottomAndRight}, inset 0 -10px 10px -10px ${bottomAndRight}`;

  return {
    boxShadow,
    borderTopColor: topAndLeft,
    borderLeftColor: topAndLeft,
    borderRightColor: bottomAndRight,
    borderBottomColor: bottomAndRight,
  };
}

export default function Board({
  board,
  overlays,
  highlights,
  onClickSquare,
  isHidden,
  setIsHidden,
  hiddenText,
  shownDifficulties,
  onReveal,
  pauseRequestName,
  clearPauseRequest,
}: Props) {
  const [starred, setStarred] = useState<ReadonlyArray<number>>([]);
  return (
    <div className={classes.boardContainer}>
      {board.map((square, squareIndex) => (
        <div
          key={squareIndex}
          className={`${classes.unselectable} ${classes.square} ${getColorClass(
            board[squareIndex].color
          )}`}
          onClick={() => onClickSquare != null && onClickSquare(squareIndex)}
          onContextMenu={(event) => {
            event.preventDefault();
            if (starred.includes(squareIndex)) {
              setStarred(starred.filter((idx) => idx !== squareIndex));
            } else {
              setStarred([...starred, squareIndex]);
            }
          }}
          style={
            highlights == null || board[squareIndex].color !== "blank"
              ? undefined
              : getBorderStyles(highlights[squareIndex])
          }
        >
          {starred.includes(squareIndex) && <div className={classes.starred} />}
          {shownDifficulties.length > 0 &&
            getDifficulty(square.name, shownDifficulties)}
          <SquareText
            key={square.name}
            text={square.name}
            hasOverlays={overlays != null}
          />
          {overlays != null && overlays[squareIndex] != null && (
            <div className={classes.overlay}>{overlays[squareIndex]}</div>
          )}
        </div>
      ))}
      {pauseRequestName != null && (
        <div
          className={`${classes.boardCover} ${classes.pauseRequestShadow} ${classes.unselectable}`}
          onClick={() => {
            if (clearPauseRequest != null) {
              clearPauseRequest();
            }
            setIsHidden(false);
            if (onReveal != null) {
              onReveal();
            }
          }}
        >
          Pause requested by {pauseRequestName}!<br />
          Please pause your game and coordinate in chat.
          <br />
          Click to reveal the board again.
        </div>
      )}
      {pauseRequestName == null && isHidden && (
        <div
          className={`${classes.boardCover} ${classes.boardCoverShadow} ${classes.unselectable}`}
          onClick={() => {
            setIsHidden(false);
            if (onReveal != null) {
              onReveal();
            }
          }}
        >
          {hiddenText ?? <span>Click to Reveal</span>}
        </div>
      )}
    </div>
  );
}
