export interface Widget {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  lockAspectRatio?: boolean;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WidgetGeometry extends Rect {
  widgetId: string;
}

export interface GeometryEvent {
  type: "geometry";
  action: "move" | "resize" | "group-move" | "group-resize";
  geometries: ReadonlyArray<WidgetGeometry>;
}

export type EditorEvent = GeometryEvent;

export interface HistoryState {
  events: ReadonlyArray<EditorEvent>;
  index: number;
}

export type HistoryAction =
  | { type: "commit"; event: EditorEvent }
  | { type: "undo" }
  | { type: "redo" };
