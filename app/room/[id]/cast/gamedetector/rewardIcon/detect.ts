// Finds a gift, gold or cherry icon near the screen's bottom-right corner.
// Its position is measured from that corner so scale errors barely move it.

import { sample } from "../imageMath";
import { PARAMS } from "../params";
import { screenScale } from "../screen";
import type { ImageDataLike } from "../types";
import { getIconFrames, ICON_FROM_BOTTOM, ICON_FROM_RIGHT, ICON_SIZE } from "./model";
import type { IconFrame, RewardIcon } from "./model";

export type RewardIconResult = {
  // Best matching icon, found or not
  icon: RewardIcon;
  score: number;
  // Best score of the other icons
  otherScore: number;
  found: boolean;
};

const grid = new Float32Array(ICON_SIZE * ICON_SIZE * 3);

function sampleGrid(img: ImageDataLike, x: number, y: number, s: number) {
  for (let j = 0; j < ICON_SIZE; j++) {
    for (let i = 0; i < ICON_SIZE; i++) {
      sample(img, x + (i + 0.5) * s, y + (j + 0.5) * s, grid, (j * ICON_SIZE + i) * 3);
    }
  }
}

// Share of the variance the frame explains, with one gain for all channels and
// an offset per channel. The shared gain keeps the icon's colors, so red can't
// match gold.
function frameScore(f: IconFrame): number {
  const n = f.pixels.length;
  let cov = 0;
  let total = 0;
  for (let c = 0; c < 3; c++) {
    const tb = c * n;
    let sum = 0;
    let sum2 = 0;
    for (let j = 0; j < n; j++) {
      const o = grid[f.pixels[j] * 3 + c];
      sum += o;
      sum2 += o * o;
      // The template is centered, so this sums to the covariance
      cov += o * f.values[tb + j];
    }
    total += sum2 - (sum * sum) / n;
  }
  const tss = f.ss[0] + f.ss[1] + f.ss[2];
  return cov > 0 && total > 1e-6 && tss > 1e-6 ? (cov * cov) / (tss * total) : 0;
}

export function detectRewardIcon(img: ImageDataLike): RewardIconResult | null {
  const s0 = screenScale(img.width, img.height);
  if (s0 < 1) return null;
  const frames = getIconFrames();
  const x0 = img.width - ICON_FROM_RIGHT * s0;
  const y0 = img.height - ICON_FROM_BOTTOM * s0;

  // Search in whole game pixels first
  const bestByIcon = new Map<RewardIcon, number>();
  let best = { score: -1, frame: frames[0], x: x0, y: y0 };
  for (let dy = -PARAMS.iconSearch; dy <= PARAMS.iconSearch; dy++) {
    for (let dx = -PARAMS.iconSearch; dx <= PARAMS.iconSearch; dx++) {
      const x = x0 + dx * s0;
      const y = y0 + dy * s0;
      sampleGrid(img, x, y, s0);
      for (const f of frames) {
        const sc = frameScore(f);
        if (sc > (bestByIcon.get(f.icon) ?? -1)) bestByIcon.set(f.icon, sc);
        if (sc > best.score) best = { score: sc, frame: f, x, y };
      }
    }
  }

  // Then fit the best frame's position and scale more finely
  let { x, y, score } = best;
  let s = s0;
  let stepXY = 0.5 * s0;
  let stepS = 0.02;
  for (let iter = 0; iter < 40 && stepXY > 0.1 * s0; iter++) {
    let improved = false;
    for (const [dx, dy, ds] of [
      [stepXY, 0, 0],
      [-stepXY, 0, 0],
      [0, stepXY, 0],
      [0, -stepXY, 0],
      [0, 0, stepS],
      [0, 0, -stepS],
    ]) {
      const ns = s * (1 + ds);
      // Scale about the icon center
      const nx = x + dx - (ns - s) * ICON_SIZE * 0.5;
      const ny = y + dy - (ns - s) * ICON_SIZE * 0.5;
      sampleGrid(img, nx, ny, ns);
      const sc = frameScore(best.frame);
      if (sc > score) {
        score = sc;
        x = nx;
        y = ny;
        s = ns;
        improved = true;
      }
    }
    if (!improved) {
      stepXY *= 0.5;
      stepS *= 0.5;
    }
  }

  const icon = best.frame.icon;
  let otherScore = 0;
  for (const [other, sc] of bestByIcon) {
    if (other !== icon && sc > otherScore) otherScore = sc;
  }
  const found = score >= PARAMS.iconMinScore && score - otherScore >= PARAMS.iconMinMargin;
  return { icon, score, otherScore, found };
}
