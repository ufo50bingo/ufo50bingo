import useLocalString from "../localStorage/useLocalString";
import { getColorHex } from "../color";

export default function useCustomColor(): [string, (newValue: string) => void] {
  return useLocalString({
    key: "custom_color",
    defaultValue: getColorHex("red"),
  });
}
