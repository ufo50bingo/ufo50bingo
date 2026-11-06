"use client";

import { useCallback } from "react";
import CanvasViewport from "./CanvasViewport";
import WidgetView from "./WidgetView";
import useCanvasScale from "./useCanvasScale";
import useEditorHistory from "./useEditorHistory";
import useSelection from "./useSelection";
import useUndoRedoShortcuts from "./useUndoRedoShortcuts";
import useWidgetInteractions from "./useWidgetInteractions";
import type { Widget } from "./layoutTypes";
import Board from "../Board";
import { TBoard } from "../matches/parseBingosyncData";
import PlayedGame from "../room/[id]/cast/PlayedGame";
import { STANDARD_UFO } from "../pastas/standardUfo";
import getGameList from "../room/[id]/common/getGameList";

type Props = {
  canvasWidth: number;
  canvasHeight: number;
};

const board: TBoard = [
  { name: "BARBUTA: Speak to 2 different Bean NPCs", color: "blank" },
  { name: "BARBUTA: Speak to 2 different Bean NPCs", color: "blank" },
  { name: "BARBUTA: Speak to 2 different Bean NPCs", color: "blank" },
  { name: "BARBUTA: Speak to 2 different Bean NPCs", color: "blank" },
  { name: "BARBUTA: Speak to 2 different Bean NPCs", color: "blank" },
  { name: "BARBUTA: Speak to 2 different Bean NPCs", color: "blank" },
  { name: "BARBUTA: Speak to 2 different Bean NPCs", color: "blank" },
  { name: "BARBUTA: Speak to 2 different Bean NPCs", color: "blank" },
  { name: "BARBUTA: Speak to 2 different Bean NPCs", color: "blank" },
  { name: "BARBUTA: Speak to 2 different Bean NPCs", color: "blank" },
  { name: "BARBUTA: Speak to 2 different Bean NPCs", color: "blank" },
  { name: "BARBUTA: Speak to 2 different Bean NPCs", color: "blank" },
  { name: "BARBUTA: Speak to 2 different Bean NPCs", color: "blank" },
  { name: "BARBUTA: Speak to 2 different Bean NPCs", color: "blank" },
  { name: "BARBUTA: Speak to 2 different Bean NPCs", color: "blank" },
  { name: "BARBUTA: Speak to 2 different Bean NPCs", color: "blank" },
  { name: "BARBUTA: Speak to 2 different Bean NPCs", color: "blank" },
  { name: "BARBUTA: Speak to 2 different Bean NPCs", color: "blank" },
  { name: "BARBUTA: Speak to 2 different Bean NPCs", color: "blank" },
  { name: "BARBUTA: Speak to 2 different Bean NPCs", color: "blank" },
  { name: "BARBUTA: Speak to 2 different Bean NPCs", color: "blank" },
  { name: "BARBUTA: Speak to 2 different Bean NPCs", color: "blank" },
  { name: "BARBUTA: Speak to 2 different Bean NPCs", color: "blank" },
  { name: "BARBUTA: Speak to 2 different Bean NPCs", color: "blank" },
  { name: "BARBUTA: Speak to 2 different Bean NPCs", color: "blank" },
];

const initialWidgets: ReadonlyArray<Widget> = [
  {
    id: "1",
    x: 50,
    y: 50,
    width: 100,
    height: 100,
    content: <div>Random widget</div>,
  },
  {
    id: "2",
    x: 200,
    y: 50,
    width: 60,
    height: 68,
    lockAspectRatio: true,
    content: (
      <PlayedGame
        game="barbuta"
        startTime={0}
        endTime={1000}
        font="default"
        gameList={getGameList(STANDARD_UFO)}
      />
    ),
  },
  {
    id: "3",
    x: 350,
    y: 50,
    width: 525,
    height: 475,
    content: (
      <Board
        board={board}
        onClickSquare={() => {}}
        boardCover={null}
        shownDifficulties={[]}
        viewerColor="red"
        maxFontSize={100}
        minFontSize={9.1}
        rows={5}
        columns={5}
      />
    ),
  },
];

export default function LayoutEditor({ canvasWidth, canvasHeight }: Props) {
  const { widgets, commit, undo, redo } = useEditorHistory(initialWidgets);
  const scale = useCanvasScale(canvasWidth, canvasHeight);
  const selection = useSelection();
  const { clearSelection } = selection;

  const interactions = useWidgetInteractions({
    canvasWidth,
    canvasHeight,
    scale,
    onCommit: commit,
  });

  const handleUndo = useCallback(() => {
    clearSelection();
    undo();
  }, [clearSelection, undo]);

  const handleRedo = useCallback(() => {
    clearSelection();
    redo();
  }, [clearSelection, redo]);

  useUndoRedoShortcuts({ undo: handleUndo, redo: handleRedo });

  return (
    <CanvasViewport
      canvasWidth={canvasWidth}
      canvasHeight={canvasHeight}
      scale={scale}
      interactions={interactions}
      selection={selection}
    >
      {widgets.map((widget) => (
        <WidgetView key={widget.id} widget={widget} />
      ))}
    </CanvasViewport>
  );
}
