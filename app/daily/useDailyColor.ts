import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { COLORS } from "../room/[id]/common/ColorSelector";
import useLocalEnum from "../localStorage/useLocalEnum";

export default function useDailyColor(): [
  BingosyncColor,
  (newColor: BingosyncColor) => unknown
] {
  return useLocalEnum({ key: "daily-color", defaultValue: "red", options: COLORS });
}
