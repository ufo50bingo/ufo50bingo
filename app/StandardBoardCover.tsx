import { ReactNode } from "react";
import classes from "./Board.module.css";

type Props = {
  content?: ReactNode;
  onReveal?: () => unknown;
  isTranslucent?: boolean;
  hasRedBorder?: boolean;
};

export default function StandardBoardCover({
  content,
  onReveal,
  isTranslucent,
  hasRedBorder,
}: Props) {
  return (
    <div
      className={`${classes.boardCover} ${hasRedBorder ? classes.pauseRequestShadow : classes.boardCoverShadow} ${isTranslucent ? classes.boardCoverTranslucent : classes.boardCoverOpaque} ${classes.unselectable}`}
      onClick={() => {
        if (onReveal != null) {
          onReveal();
        }
      }}
    >
      {content ?? <span>Click to Reveal</span>}
    </div>
  );
}
