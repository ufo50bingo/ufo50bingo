import useLocalEnum from "../localStorage/useLocalEnum";
import { GOOGLE_FONT_KEYS, GoogleFont } from "./googleFonts";

const OPTIONS = ["default", "ufo50"] as const;
export type Font = (typeof OPTIONS)[number];

export type LayoutFont = Font | GoogleFont;
export const LAYOUT_FONT_OPTIONS: ReadonlyArray<LayoutFont> = [
  ...OPTIONS,
  ...GOOGLE_FONT_KEYS,
];

export default function useFont(): [Font, (newValue: Font) => void] {
  return useLocalEnum({
    key: "font",
    options: OPTIONS,
    defaultValue: "default",
  });
}
