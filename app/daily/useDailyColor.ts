import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { useCallback, useState } from "react";

const KEY = "daily-color";

export default function useDailyColor(): [
  BingosyncColor,
  (newColor: BingosyncColor) => unknown
] {
  const [color, setColorRaw] = useState<BingosyncColor>(() => {
    if (global.window == undefined || localStorage == null) {
      return "red";
    }
    const fromStorage = localStorage.getItem(KEY);
    if (fromStorage == null || fromStorage === "") {
      return "red";
    }
    return fromStorage as BingosyncColor;
  });

  const setColor = useCallback(async (newColor: BingosyncColor) => {
    setColorRaw(newColor);
    if (global.window == undefined || localStorage == null) {
      return;
    }
    localStorage.setItem(KEY, newColor);
  }, []);

  return [color, setColor];
}
