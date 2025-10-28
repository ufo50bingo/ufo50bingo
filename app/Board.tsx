import SquareText from "./SquareText";
import classes from "./Board.module.css";
import { ReactNode, useState } from "react";
import { BingosyncColor, TBoard } from "./matches/parseBingosyncData";
import { Difficulty } from "./goals";
import { GOAL_TO_TYPES } from "./room/[id]/cast/goalToTypes";
import { SPICY_GOAL_TO_TYPES } from "./room/[id]/cast/spicyGoalToTypes";

type Props = {
  board: TBoard;
  overlays?: ReadonlyArray<null | ReactNode>;
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
  let types = GOAL_TO_TYPES[name];
  if (types == null) {
    types = SPICY_GOAL_TO_TYPES[name];
    if (types == null) {
      return null;
    }
  }
  const difficulty = types[1];
  if (difficulty == null || !shownDifficulties.includes(difficulty)) {
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
  }
  return (
    <>
      <div className={`${classes.difficulty} ${difficultyClass}`} />
      <div className={classes.difficultyBorder} />
      <div className={classes.difficultyLetter}>{letter}</div>
    </>
  );
}

export default function Board({
  board,
  overlays,
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
