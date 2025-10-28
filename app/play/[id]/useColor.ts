import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { useCallback, useState } from "react";
import chooseColor from "./chooseColor";

export default function useColor(
  id: string
): [null | BingosyncColor, (newColor: BingosyncColor) => unknown] {
  const key = `${id}-color`;

  const [color, setColorRaw] = useState<null | BingosyncColor>(() => {
    if (global.window == undefined || localStorage == null) {
      return null;
    }
    const fromStorage = localStorage.getItem(key);
    if (fromStorage == null || fromStorage === "") {
      return null;
    }
    return fromStorage as BingosyncColor;
  });

  const setColor = useCallback(
    async (newColor: BingosyncColor) => {
      setColorRaw(newColor);
      if (global.window == undefined || localStorage == null) {
        return;
      }
      localStorage.setItem(key, newColor);
      await chooseColor(id, newColor);
    },
    [key, id]
  );

  return [color, setColor];
}
