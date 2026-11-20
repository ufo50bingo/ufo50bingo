"use client";

import { useCallback, useMemo, useState } from "react";
import CanvasViewport from "./CanvasViewport";
import LayoutSidebar from "./LayoutSidebar";
import WidgetView from "./WidgetView";
import useCanvasScale from "./useCanvasScale";
import useEditorHistory from "./useEditorHistory";
import useSelection from "./useSelection";
import useUndoRedoShortcuts from "./useUndoRedoShortcuts";
import useWidgetInteractions from "./useWidgetInteractions";
import type { Widget } from "./layoutTypes";
import Board from "../Board";
import { BingosyncColor } from "../color";

type Props = {
  canvasWidth: number;
  canvasHeight: number;
};

const squareNames: ReadonlyArray<string> = Array(25).fill(
  "BARBUTA: Speak to 2 different Bean NPCs",
);
const squareColors: ReadonlyArray<ReadonlyArray<BingosyncColor>> = Array(
  25,
).fill([]);

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
    content: <div />,
  },
  {
    id: "3",
    x: 350,
    y: 50,
    width: 525,
    height: 475,
    content: (
      <Board
        squareNames={squareNames}
        squareColors={squareColors}
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

export default function LayoutEditor(props: Props) {
  const [name, setName] = useState("Untitled layout");
  const [canvasSize, setCanvasSize] = useState({
    width: props.canvasWidth,
    height: props.canvasHeight,
  });
  const canvasWidth = canvasSize.width;
  const canvasHeight = canvasSize.height;
  const handleCanvasSizeChange = useCallback(
    (width: number, height: number) => setCanvasSize({ width, height }),
    [],
  );

  const { widgets, commit, undo, redo } = useEditorHistory(initialWidgets);
  const [viewportEl, setViewportEl] = useState<HTMLDivElement | null>(null);
  const scale = useCanvasScale(viewportEl, canvasWidth, canvasHeight);
  const selection = useSelection();
  const { clearSelection, selectedTargets } = selection;

  const selectedWidgets = useMemo(() => {
    const selectedIds = new Set(
      selectedTargets.map((element) => element.dataset.id),
    );
    return widgets.filter((widget) => selectedIds.has(widget.id));
  }, [selectedTargets, widgets]);

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
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <LayoutSidebar
        name={name}
        onNameChange={setName}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        onCanvasSizeChange={handleCanvasSizeChange}
        selectedWidgets={selectedWidgets}
        onDeselect={clearSelection}
      />
      <CanvasViewport
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        scale={scale}
        viewportEl={viewportEl}
        onViewportRef={setViewportEl}
        interactions={interactions}
        selection={selection}
      >
        {widgets.map((widget) => (
          <WidgetView key={widget.id} widget={widget} />
        ))}
      </CanvasViewport>
    </div>
  );
}
