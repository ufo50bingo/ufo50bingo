// Reward icon templates: each distinct animation frame over its opaque pixels,
// blurred like a stream and centered per channel

import { blurMasked, decode } from "../cartridge/model";
import { REWARD_ICON_FRAMES, REWARD_ICON_PALETTE, REWARD_ICON_PIXELS, REWARD_ICONS } from "../generated/rewardIcons";
import { PARAMS } from "../params";

export type RewardIcon = (typeof REWARD_ICONS)[number];

export const ICON_SIZE = 16;
// Icon top-left in game px from the screen's bottom-right corner (it sits at 360,192 of 384x216)
export const ICON_FROM_RIGHT = 24;
export const ICON_FROM_BOTTOM = 24;

export type IconFrame = {
  icon: RewardIcon;
  // Indices of the opaque pixels in the 16x16 grid
  pixels: Uint16Array;
  // [channel * n + i] for the n opaque pixels
  values: Float32Array;
  // Sum of squares of values per channel
  ss: Float32Array;
};

let frames: IconFrame[] | null = null;

function buildFrames(): IconFrame[] {
  const n0 = ICON_SIZE * ICON_SIZE;
  const total = REWARD_ICON_FRAMES.reduce((a, b) => a + b, 0);
  const idx = decode(REWARD_ICON_PIXELS, 0, total * n0);
  const out: IconFrame[] = [];
  let f = 0;
  REWARD_ICONS.forEach((icon, i) => {
    for (let k = 0; k < REWARD_ICON_FRAMES[i]; k++, f++) {
      const base = f * n0;
      const known = new Float32Array(n0);
      const sel: number[] = [];
      for (let p = 0; p < n0; p++) {
        if (idx[base + p] !== 0) {
          known[p] = 1;
          sel.push(p);
        }
      }
      const n = sel.length;
      const values = new Float32Array(3 * n);
      const ss = new Float32Array(3);
      for (let c = 0; c < 3; c++) {
        const plane = new Float32Array(n0);
        for (const p of sel) plane[p] = REWARD_ICON_PALETTE[idx[base + p] * 3 + c];
        const b = PARAMS.refBlur > 0 ? blurMasked(plane, known, ICON_SIZE, ICON_SIZE, PARAMS.refBlur) : plane;
        let mean = 0;
        for (const p of sel) mean += b[p];
        mean /= n;
        for (let j = 0; j < n; j++) {
          const v = b[sel[j]] - mean;
          values[c * n + j] = v;
          ss[c] += v * v;
        }
      }
      out.push({ icon, pixels: Uint16Array.from(sel), values, ss });
    }
  });
  return out;
}

export function getIconFrames(): IconFrame[] {
  if (frames == null) frames = buildFrames();
  return frames;
}
