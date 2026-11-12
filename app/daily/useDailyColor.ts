import useLocalEnum from "../localStorage/useLocalEnum";
import { BingosyncColor, COLORS } from "../color";

export default function useDailyColor(): [
  BingosyncColor,
  (newColor: BingosyncColor) => unknown,
] {
  return useLocalEnum({
    key: "daily-color",
    defaultValue: "red",
    options: COLORS,
  });
}
