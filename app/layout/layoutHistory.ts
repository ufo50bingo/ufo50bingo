import type {
  EditorEvent,
  HistoryAction,
  HistoryState,
  Widget,
} from "./layoutTypes";

export const initialHistoryState: HistoryState = { events: [], index: 0 };

export function replayEvents(
  initial: ReadonlyArray<Widget>,
  events: ReadonlyArray<EditorEvent>,
): ReadonlyArray<Widget> {
  const widgets = new Map(initial.map((widget) => [widget.id, { ...widget }]));

  for (const event of events) {
    switch (event.type) {
      case "geometry":
        for (const geometry of event.geometries) {
          const widget = widgets.get(geometry.widgetId);

          if (widget != null) {
            Object.assign(widget, {
              x: geometry.x,
              y: geometry.y,
              width: geometry.width,
              height: geometry.height,
            });
          }
        }
        break;
    }
  }

  return Array.from(widgets.values());
}

export function historyReducer(
  state: HistoryState,
  action: HistoryAction,
): HistoryState {
  switch (action.type) {
    case "commit":
      return {
        events: [...state.events.slice(0, state.index), action.event],
        index: state.index + 1,
      };
    case "undo":
      return { ...state, index: Math.max(0, state.index - 1) };
    case "redo":
      return {
        ...state,
        index: Math.min(state.events.length, state.index + 1),
      };
  }
}
