"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import SelectionControls from "./SelectionControls";
import type { SelectionApi } from "./useSelection";
import type { WidgetInteractionHandlers } from "./useWidgetInteractions";

type Props = {
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
  interactions: WidgetInteractionHandlers;
  selection: SelectionApi;
  children: ReactNode;
};

export default function CanvasViewport({
  canvasWidth,
  canvasHeight,
  scale,
  interactions,
  selection,
  children,
}: Props) {
  const [viewportEl, setViewportEl] = useState<HTMLDivElement | null>(null);
  const [stageEl, setStageEl] = useState<HTMLDivElement | null>(null);

  return (
    <div
      ref={setViewportEl}
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          width: canvasWidth * scale,
          height: canvasHeight * scale,
          position: "relative",
          flexShrink: 0,
        }}
      >
        <div
          ref={setStageEl}
          className="editor-stage"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            position: "absolute",
            top: 0,
            left: 0,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            backgroundImage:
              "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%)",
            backgroundSize: "40px 40px",
          }}
        >
          {children}

          {viewportEl != null && stageEl != null && (
            <SelectionControls
              viewportEl={viewportEl}
              stageEl={stageEl}
              interactions={interactions}
              selection={selection}
            />
          )}
        </div>
      </div>
    </div>
  );
}
