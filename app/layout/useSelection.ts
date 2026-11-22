import { useCallback, useState } from "react";
import type { ComponentProps } from "react";
import type Selecto from "react-selecto";

type SelectEndEvent = Parameters<
  NonNullable<ComponentProps<typeof Selecto>["onSelectEnd"]>
>[0];

type SelectDragStartEvent = Parameters<
  NonNullable<ComponentProps<typeof Selecto>["onDragStart"]>
>[0];

export type SelectionApi = {
  selectedTargets: ReadonlyArray<HTMLElement>;
  clearSelection: () => void;
  handleSelectEnd: (e: SelectEndEvent) => void;
  handleSelectDragStart: (e: SelectDragStartEvent) => void;
};

export default function useSelection(): SelectionApi {
  const [selectedTargets, setSelectedTargets] = useState<
    ReadonlyArray<HTMLElement>
  >([]);

  const clearSelection = useCallback(() => setSelectedTargets([]), []);

  const handleSelectEnd = useCallback((e: SelectEndEvent) => {
    setSelectedTargets(
      e.selected.filter(
        (element): element is HTMLElement => element instanceof HTMLElement,
      ),
    );
  }, []);

  const handleSelectDragStart = useCallback(
    (e: SelectDragStartEvent) => {
      const target = e.inputEvent.target;

      if (!(target instanceof Element)) {
        return;
      }

      // don't start selection if we're dragging on a control box
      if (target.closest(".moveable-control-box") != null) {
        e.stop();
        return;
      }

      const shiftKey =
        e.inputEvent instanceof MouseEvent && e.inputEvent.shiftKey;

      // if widget is already selected, dragging on it should move it (/the group)
      // instead of starting new selection
      if (
        !shiftKey &&
        selectedTargets.some(
          (selected) => selected === target || selected.contains(target),
        )
      ) {
        e.stop();
      }
    },
    [selectedTargets],
  );

  return {
    selectedTargets,
    clearSelection,
    handleSelectEnd,
    handleSelectDragStart,
  };
}
