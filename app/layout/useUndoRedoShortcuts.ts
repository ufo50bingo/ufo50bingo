import { useEffect } from "react";

type Props = {
  undo: () => void;
  redo: () => void;
};

export default function useUndoRedoShortcuts({ undo, redo }: Props) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const modifier = e.ctrlKey || e.metaKey;

      if (!modifier || e.altKey) {
        return;
      }

      const target = e.target;

      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      if (key === "z") {
        e.preventDefault();

        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if (key === "y" && !e.shiftKey) {
        e.preventDefault();
        redo();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo]);
}
