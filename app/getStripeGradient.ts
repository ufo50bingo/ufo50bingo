import { BingosyncColor } from "./matches/parseBingosyncData";
import getColorHex from "./room/[id]/cast/getColorHex";

// 45 deg doesn't exactly wor because cells aren't exact squares
// also probably want a gradient for each stripe instead of a flat color
export default function getStripeGradient(
  colors: ReadonlyArray<BingosyncColor>
): string {
  let start = 0;
  const interval = 100 / colors.length;
  let strips = "";
  colors.forEach((color) => {
    strips += ", ";
    const hex = getColorHex(color);
    strips += `${hex} ${start}%, ${hex} ${start + interval}%`;
    start += interval;
  });
  return `linear-gradient(-45deg${strips})`;
}
