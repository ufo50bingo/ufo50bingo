// Cartridge sprite and library layout, in game pixels.

import type { Aligned, ImageDataLike } from "../types";

export const CW = 32; // cartridge width including the 2px shadow
export const CH = 36;
export const ART_X = 3; // top-left of the 24x24 label art
export const ART_Y = 1;
export const ART_N = 24;
export const ART_PX = ART_N * ART_N;
export const GRID_DX = 36; // library grid pitch
export const GRID_DY = 38;

/** Cartridges centered in this top-right share of the frame may sit under Discord's LIVE badge. */
export const BADGE_ZONE_X = 0.55;
export const BADGE_ZONE_Y = 0.35;

export function inBadgeZone(img: ImageDataLike, a: Aligned): boolean {
  return a.x + 15 * a.s > BADGE_ZONE_X * img.width && a.y + 17 * a.s < BADGE_ZONE_Y * img.height;
}
