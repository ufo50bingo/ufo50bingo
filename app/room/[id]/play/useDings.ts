import { useCallback, useState } from "react";
import { RoomView } from "../roomCookie";

export type Ding = "chat" | "square" | "pause";

const DEFAULT_DINGS = ["chat", "pause"];

export default function useDings(
  view: RoomView
): [ReadonlyArray<Ding>, (newDings: ReadonlyArray<Ding>) => unknown] {
  const [dings, setDingsRaw] = useState<ReadonlyArray<Ding>>(() => {
    if (global.window == undefined || localStorage == null) {
      return DEFAULT_DINGS;
    }
    const fromStorage = localStorage.getItem(`${view}-dings`);
    if (fromStorage == null || fromStorage === "") {
      return DEFAULT_DINGS;
    }
    try {
      const parsed = JSON.parse(fromStorage);
      if (typeof parsed !== "object") {
        return DEFAULT_DINGS;
      }
      return parsed;
    } catch {
      return DEFAULT_DINGS;
    }
  });

  const setDings = useCallback(
    (newDings: ReadonlyArray<Ding>) => {
      setDingsRaw(newDings);
      if (global.window == undefined || localStorage == null) {
        return;
      }
      localStorage.setItem(`${view}-dings`, JSON.stringify(newDings));
    },
    [view]
  );

  return [dings, setDings];
}
