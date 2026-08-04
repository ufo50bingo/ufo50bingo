import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { useCallback } from "react";
import chooseColor from "./chooseColor";
import { COLORS } from "../common/ColorSelector";
import useLocalEnum from "@/app/localStorage/useLocalEnum";
import { RoomBackend } from "@/app/roomApi";

export default function useColor(
  id: string,
  roomBackend: RoomBackend,
): [null | BingosyncColor, (newColor: BingosyncColor) => unknown] {
  const [color, setColorRaw] = useLocalEnum({
    key: `${id}-color`,
    defaultValue: "red",
    options: COLORS,
  });

  const setColor = useCallback(
    async (newColor: BingosyncColor) => {
      setColorRaw(newColor);
      await chooseColor(id, newColor, roomBackend);
    },
    [id, setColorRaw]
  );

  return [color, setColor];
}
