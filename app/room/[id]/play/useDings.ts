import { useCallback, useState } from "react";

export type Ding = "chat" | "square" | "pause";

export default function useDings(): [
  ReadonlyArray<Ding>,
  (newDings: ReadonlyArray<Ding>) => unknown
] {
  const [dings, setDingsRaw] = useState<ReadonlyArray<Ding>>(() => {
    if (global.window == undefined || localStorage == null) {
      return [];
    }
    const fromStorage = localStorage.getItem("dings");
    if (fromStorage == null || fromStorage === "") {
      return [];
    }
    try {
      const parsed = JSON.parse(fromStorage);
      if (typeof parsed !== "object") {
        return [];
      }
      return parsed;
    } catch {
      return [];
    }
  });

  const setDings = useCallback((newDings: ReadonlyArray<Ding>) => {
    setDingsRaw(newDings);
    if (global.window == undefined || localStorage == null) {
      return;
    }
    localStorage.setItem("dings", JSON.stringify(newDings));
  }, []);

  return [dings, setDings];
}
