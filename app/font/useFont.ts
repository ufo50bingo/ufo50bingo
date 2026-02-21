import useLocalEnum from "../localStorage/useLocalEnum";

const OPTIONS = ["default", "ufo50"] as const;
export type Font = (typeof OPTIONS)[number];

export default function useFont(): [Font, (newValue: Font) => void] {
  return useLocalEnum({ key: "font", options: ["default", "ufo50"], defaultValue: "default" });
}