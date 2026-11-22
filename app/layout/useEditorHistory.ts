import { useCallback, useState } from "react";
import type { Widget } from "./widgetTypes";

export type WidgetsUpdate = (
  widgets: ReadonlyArray<Widget>,
) => ReadonlyArray<Widget>;

type History = {
  snapshots: ReadonlyArray<ReadonlyArray<Widget>>;
  index: number;
};

export default function useEditorHistory(
  initialWidgets: ReadonlyArray<Widget>,
) {
  const [history, setHistory] = useState<History>({
    snapshots: [initialWidgets],
    index: 0,
  });

  const commit = useCallback(
    (update: WidgetsUpdate) =>
      setHistory(({ snapshots, index }) => ({
        snapshots: [...snapshots.slice(0, index + 1), update(snapshots[index])],
        index: index + 1,
      })),
    [],
  );
  const undo = useCallback(
    () => setHistory((h) => ({ ...h, index: Math.max(0, h.index - 1) })),
    [],
  );
  const redo = useCallback(
    () =>
      setHistory((h) => ({
        ...h,
        index: Math.min(h.snapshots.length - 1, h.index + 1),
      })),
    [],
  );

  return { widgets: history.snapshots[history.index], commit, undo, redo };
}
