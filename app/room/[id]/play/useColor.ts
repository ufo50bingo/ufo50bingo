import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { useCallback, useState } from "react";
import chooseColor from "./chooseColor";
import { COLORS } from "../common/ColorSelector";
import useLocalEnum from "@/app/localStorage/useLocalEnum";

export default function useColor(
  id: string
): [null | BingosyncColor, (newColor: BingosyncColor) => unknown] {
  const [color, setColorRaw] = useLocalEnum({ key: `${id}-color`, defaultValue: "red", options: COLORS });

  const setColor = useCallback(
    async (newColor: BingosyncColor) => {
      setColorRaw(newColor);
      await chooseColor(id, newColor);
    },
    [id]
  );

  return [color, setColor];
}
