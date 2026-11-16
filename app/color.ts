import classes from "./color.module.css";

export const COLOR_INFO = [
  {
    key: "red",
    name: "Red",
    hex: "#da4440",
    emoji: "🟥",
    squareClass: classes.redsquare,
  },
  {
    key: "blue",
    name: "Blue",
    hex: "#37a1de",
    emoji: "🟦",
    squareClass: classes.bluesquare,
  },
  {
    key: "green",
    name: "Green",
    hex: "#00b500",
    emoji: "🟩",
    squareClass: classes.greensquare,
  },
  {
    key: "orange",
    name: "Orange",
    hex: "#f98e1e",
    emoji: "🟧",
    squareClass: classes.orangesquare,
  },
  {
    key: "purple",
    name: "Purple",
    hex: "#7a27b5",
    emoji: "🟪",
    squareClass: classes.purplesquare,
  },
  {
    key: "navy",
    name: "Navy",
    hex: "#083a95",
    emoji: "🟦",
    squareClass: classes.navysquare,
  },
  {
    key: "teal",
    name: "Teal",
    hex: "#388584",
    emoji: "🟩",
    squareClass: classes.tealsquare,
  },
  {
    key: "pink",
    name: "Pink",
    hex: "#dd7a9d",
    emoji: "🟪",
    squareClass: classes.pinksquare,
  },
  {
    key: "brown",
    name: "Brown",
    hex: "#8c4a1a",
    emoji: "🟫",
    squareClass: classes.brownsquare,
  },
  {
    key: "yellow",
    name: "Yellow",
    hex: "#ccc50f",
    emoji: "🟨",
    squareClass: classes.yellowsquare,
  },
] as const;

export const COLORS: ReadonlyArray<BingosyncColor> = COLOR_INFO.map(
  (i) => i.key,
);

export type BingosyncColor = (typeof COLOR_INFO)[number]["key"];
type ColorInfo = {
  key: BingosyncColor;
  name: string;
  hex: string;
  emoji: string;
  squareClass: string;
};

export const BLANK_WHITE = "#c8c8c8";
export const BLANK_SQUARE_CLASS = classes.blanksquare;

export function getColorInfo(color: BingosyncColor): ColorInfo {
  return COLOR_INFO.find((c) => c.key === color)!;
}

export function getColorHex(color: BingosyncColor): string {
  return getColorInfo(color).hex;
}

export function getColorEmoji(color: BingosyncColor): string {
  return getColorInfo(color).emoji;
}

export function getColorName(color: BingosyncColor): string {
  return getColorInfo(color).name;
}

export function getColorSquareClass(color: BingosyncColor): string {
  return getColorInfo(color).squareClass;
}
