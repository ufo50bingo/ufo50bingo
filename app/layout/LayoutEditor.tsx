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

type Props = {
  canvasWidth: number;
  canvasHeight: number;
};

const initialWidgets: ReadonlyArray<Widget> = [
  { id: "1", x: 50, y: 50, width: 100, height: 100 },
  { id: "2", x: 200, y: 50, width: 100, height: 100, lockAspectRatio: true },
  { id: "3", x: 350, y: 50, width: 100, height: 100 },
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
