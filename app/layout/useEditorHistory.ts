import { useCallback, useMemo, useReducer } from "react";
import {
  historyReducer,
  initialHistoryState,
  replayEvents,
} from "./layoutHistory";
import type { EditorEvent, Widget } from "./layoutTypes";

export default function useEditorHistory(initial: ReadonlyArray<Widget>) {
  const [history, dispatch] = useReducer(historyReducer, initialHistoryState);

  const widgets = useMemo(
    () => replayEvents(initial, history.events.slice(0, history.index)),
    [initial, history.events, history.index],
  );

  const commit = useCallback(
    (event: EditorEvent) => dispatch({ type: "commit", event }),
    [],
  );
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);

  return { widgets, commit, undo, redo };
}
