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
import { createWidget } from "./widgetInfo";
import type { WidgetType } from "./widgetInfo";
import type { Widget } from "./widgetTypes";

type Props = {
  canvasWidth: number;
  canvasHeight: number;
};

const initialWidgets: ReadonlyArray<Widget> = [
  {
    id: "1",
    type: "plain_text",
    x: 50,
    y: 50,
    z: 0,
    width: 100,
    height: 100,
    text: "Random widget",
    font: "default",
    defaultSize: 24,
    canShrink: true,
    minSize: 8,
  },
  {
    id: "2",
    type: "recent_game",
    x: 200,
    y: 50,
    z: 0,
    width: 60,
    height: 68,
    playerNum: 1,
    font: "default",
    hasDefaultTimer: true,
    recentGameNumber: 1,
  },
  {
    id: "3",
    type: "board",
    x: 350,
    y: 50,
    z: 0,
    width: 525,
    height: 475,
    font: "default",
    defaultSize: 100,
    canShrink: true,
    minSize: 9.1,
    color: { type: "custom_color", color: "#ffffff" },
    squarePadding: 5,
    borderWidth: 1,
    borderColor: "#424242",
    blankSquareColor: "#181818",
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
      selectedTargets.map((target) => target.dataset.id),
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

  const handleAddWidget = useCallback(
    (type: WidgetType) => {
      const id = crypto.randomUUID();
      commit((widgets) => {
        const z = Math.max(0, ...widgets.map((widget) => widget.z + 1));
        const widget = createWidget(type, id, z);
        return [
          ...widgets,
          {
            ...widget,
            x: Math.max(0, (canvasWidth - widget.width) / 2),
            y: Math.max(0, (canvasHeight - widget.height) / 2),
          },
        ];
      });
    },
    [commit, canvasWidth, canvasHeight],
  );

  const handleWidgetChange = useCallback(
    (edited: Widget) =>
      commit((widgets) =>
        widgets.map((widget) => (widget.id === edited.id ? edited : widget)),
      ),
    [commit],
  );

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
        onAddWidget={handleAddWidget}
        onWidgetChange={handleWidgetChange}
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
