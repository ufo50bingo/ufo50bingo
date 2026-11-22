import { useCallback, useEffect, useState } from "react";
import { GeneralCounts } from "../cast/CastPage";
import { CountChange, CountState } from "../cast/useSyncedState";

export default function useFullGeneralState(
  gameId: number,
  userId: number,
): [GeneralCounts, (change: CountChange) => unknown] {
  const key = `${gameId}-${userId}-fullgeneral`;
  const [state, setStateRaw] = useState<GeneralCounts>({});

  const setGeneralGameCount = useCallback(
    (change: CountChange) => {
      setStateRaw((prevState) => {
        const oldGeneralState: CountState = prevState[change.goal] ?? [];
        const oldCounts = oldGeneralState?.[userId] ?? {};
        const newCounts = { ...oldCounts };
        newCounts[change.game] = change.count;
        const newGeneralState = { ...oldGeneralState };
        newGeneralState[change.userId] = newCounts;
        const newGenerals = {
          ...prevState,
          [change.goal]: newGeneralState,
        };
        if (global.window != undefined && localStorage != null) {
          try {
            localStorage.setItem(key, JSON.stringify(newGenerals));
          } catch {}
        }
        return newGenerals;
      });
    },
    [key],
  );

  // clear data on key change
  useEffect(() => {
    setStateRaw(getFromStorage(key));
  }, [key]);

  return [state, setGeneralGameCount];
}

function getFromStorage(key: string): GeneralCounts {
  if (global.window == undefined || localStorage == null) {
    return {};
  }
  const fromStorage = localStorage.getItem(key);
  if (fromStorage == null || fromStorage === "") {
    return {};
  }
  try {
    // TODO: validate??
    const parsed: GeneralCounts = JSON.parse(fromStorage);
    return parsed;
  } catch {
    return {};
  }
}
