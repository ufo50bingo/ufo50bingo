import { useMemo } from "react";
import { Change, Square, TBoard } from "./parseBingosyncData";
import { getChangesWithoutMistakes } from "./analyzeMatch";
import getOverlays from "./getOverlays";
import Board from "../Board";

type Props = {
  finalBoard: TBoard;
  changes: ReadonlyArray<Change>;
  startTime: number;
  seekMs: number;
};

export default function InProgressBoard({
  changes,
  finalBoard,
  seekMs,
  startTime,
}: Props) {
  const curTime = startTime + seekMs;
  const endIndex = useMemo(() => {
    const endIndex = changes.findIndex((change) => change.time > curTime);
    return endIndex < 0 ? changes.length + 1 : endIndex;
  }, [changes, curTime]);
  const trimmedChanges = useMemo(
    () => changes.slice(0, endIndex),
    [changes, endIndex],
  );
  const noMistakes = useMemo(
    () => getChangesWithoutMistakes(trimmedChanges),
    [trimmedChanges],
  );
  const board: TBoard = useMemo(() => {
    const board: Array<Square> = finalBoard.map((square) => ({
      color: "blank",
      name: square.name,
    }));
    for (const change of trimmedChanges) {
      board[change.index] = {
        name: finalBoard[change.index].name,
        color: change.color,
      };
    }
    return board;
  }, [finalBoard, trimmedChanges]);
  const overlays = useMemo(
    () => getOverlays(noMistakes, startTime),
    [noMistakes, startTime],
  );
  return (
    <Board
      board={board}
      overlays={overlays != null ? overlays : undefined}
      onClickSquare={null}
      isHidden={false}
      setIsHidden={blank}
      shownDifficulties={["general", "veryhard"]}
      viewerColor={null}
    />
  );
}

const blank = () => {};
