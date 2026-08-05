import { useCallback, useEffect, useState } from "react";

export default function useShowAll(key: string): [ReadonlyArray<string>, (goal: string) => unknown] {
  const [showAll, setShowAllRaw] = useState<ReadonlyArray<string>>([]);
  const addShowAll = useCallback((goal: string) => {
    setShowAllRaw(prevShowAll => {
      const newShowAll = [...prevShowAll, goal];
      setShowAllRaw(newShowAll);
      if (global.window != undefined && localStorage != null) {
        localStorage.setItem(key, JSON.stringify(newShowAll));
      }
      return newShowAll;
    });
  }, []);

  // clear data on key change
  useEffect(() => {
    setShowAllRaw(getFromStorage(key));
  }, [key]);
  return [showAll, addShowAll];
}

function getFromStorage(key: string): ReadonlyArray<string> {
  if (global.window == undefined || localStorage == null) {
    return [];
  }
  const fromStorage = localStorage.getItem(key);
  if (fromStorage == null || fromStorage === "") {
    return [];
  }
  try {
    // TODO: validate??
    const parsed: ReadonlyArray<string> = JSON.parse(fromStorage);
    return parsed;
  } catch {
    return [];
  }
}