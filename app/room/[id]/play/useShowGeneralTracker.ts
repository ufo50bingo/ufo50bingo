import { useCallback, useState } from "react";

type SimpleGeneralState = { [goal: string]: number };

export default function useShowGeneralTracker(
): [boolean, (newShown: boolean) => unknown] {
  const [shown, setShownRaw] = useState(() => {
    if (global.window == undefined || localStorage == null) {
      return true;
    }
    const fromStorage = localStorage.getItem("show_general_tracker");
    return fromStorage !== 'false';
  });

  const setShown = useCallback(
    async (newShown: boolean) => {
      setShownRaw(newShown);
      if (global.window == undefined || localStorage == null) {
        return;
      }
      localStorage.setItem("show_general_tracker", newShown ? 'true' : 'false');
    },
    [],
  );

  return [shown, setShown];
}
