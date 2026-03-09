import useLocalString from "../localStorage/useLocalString";

export default function useCustomColor(): [string, (newValue: string) => void] {
  return useLocalString({
    key: "custom_color",
    defaultValue: "#ee5f5b",
  });
}
