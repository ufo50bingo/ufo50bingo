// UFO 50 renders at 384x216 game pixels; a capture is a scaled copy of that screen.
export const SCREEN_W = 384;
export const SCREEN_H = 216;

/** Input pixels per game pixel if the image shows exactly the game screen. */
export function screenScale(width: number, height: number): number {
  return Math.min(width / SCREEN_W, height / SCREEN_H);
}
