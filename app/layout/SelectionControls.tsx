"use client";

import Moveable from "react-moveable";
import Selecto from "react-selecto";
import type { SelectionApi } from "./useSelection";
import type { WidgetInteractionHandlers } from "./useWidgetInteractions";

const ALL_DIRECTIONS = ["nw", "n", "ne", "w", "e", "sw", "s", "se"];
const CORNER_DIRECTIONS = ["nw", "ne", "sw", "se"];

type Props = {
  viewportEl: HTMLElement;
  stageEl: HTMLElement;
  interactions: WidgetInteractionHandlers;
  selection: SelectionApi;
};

export default function SelectionControls({
  viewportEl,
  stageEl,
  interactions,
  selection,
}: Props) {
  const lockRatio = selection.selectedTargets.some(
    (element) => element.dataset.lockAspectRatio === "true",
  );

  return (
    <>
      <Moveable
        target={selection.selectedTargets}
        container={stageEl}
        rootContainer={viewportEl}
        draggable
        resizable
        keepRatio={lockRatio}
        renderDirections={lockRatio ? CORNER_DIRECTIONS : ALL_DIRECTIONS}
        rotatable={false}
        origin={false}
        {...interactions}
      />

      <Selecto
        container={viewportEl}
        rootContainer={viewportEl}
        dragContainer={viewportEl}
        selectableTargets={[".editor-widget"]}
        selectByClick
        selectFromInside
        continueSelect={false}
        toggleContinueSelect={["shift"]}
        onDragStart={selection.handleSelectDragStart}
        onSelectEnd={selection.handleSelectEnd}
      />
    </>
  );
}
