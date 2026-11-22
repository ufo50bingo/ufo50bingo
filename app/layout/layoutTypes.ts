import type { BaseWidget } from "./widgetTypes";

export interface GeometryEvent {
  type: "geometry";
  action: "move" | "resize" | "group-move" | "group-resize";
  geometries: ReadonlyArray<
    Pick<BaseWidget, "id" | "x" | "y" | "width" | "height">
  >;
}

export type EditorEvent = GeometryEvent;

export interface HistoryState {
  events: ReadonlyArray<EditorEvent>;
  index: number;
}

export type HistoryAction =
  { type: "commit"; event: EditorEvent } | { type: "undo" } | { type: "redo" };
