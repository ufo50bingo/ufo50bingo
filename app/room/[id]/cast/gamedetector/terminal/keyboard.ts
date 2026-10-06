/**
 * Finding the on-screen keyboard: a coarse box-sum test on the integral image,
 * then a sub-pixel fit of the whole keyboard template. The keyboard also gives
 * the black and white levels for reading the input field.
 */

import { sampleV } from "../imageMath";
import type { Integral } from "../imageMath";
import { PARAMS } from "../params";
import { screenScale } from "../screen";
import type { Aligned, Candidate, ImageDataLike } from "../types";
import { GLYPH_H, KEY_DX, KEY_DY, KEY_X, KEY_Y } from "./geometry";
import type { TerminalModel } from "./model";

let keyObs = new Float32Array(0);

/**
 * Correlation of the keyboard template with the frame for keyboard 'A' at
 * (x, y), scale s, using every `stride`-th template pixel.
 */
function keyboardScore(img: ImageDataLike, tm: TerminalModel, x: number, y: number, s: number, stride = 1): number {
  const n = tm.keyT.length;
  if (keyObs.length < n) keyObs = new Float32Array(n);
  let mean = 0;
  let tMean = 0;
  let m = 0;
  for (let i = 0; i < n; i += stride) {
    const v = sampleV(img, x + tm.keyX[i] * s, y + tm.keyY[i] * s);
    keyObs[i] = v;
    mean += v;
    tMean += tm.keyT[i];
    m++;
  }
  mean /= m;
  tMean /= m;
  let cov = 0;
  let ss = 0;
  let tt = 0;
  for (let i = 0; i < n; i += stride) {
    const d = keyObs[i] - mean;
    const t = tm.keyT[i] - tMean;
    cov += d * t;
    ss += d * d;
    tt += t * t;
  }
  return ss > 1e-6 && tt > 1e-6 ? cov / Math.sqrt(ss * tt) : 0;
}

/**
 * Coarse search for the keyboard on the integral image: the 8 glyph columns
 * must be clearly brighter than the gaps between them. Returns input-pixel
 * coordinates of keyboard 'A'.
 */
export function findKeyboard(integ: Integral, scaleHint?: number): Candidate | null {
  const { S, W, H, f } = integ;
  const W1 = W + 1;
  const s0 = screenScale(W, H);
  const scales: number[] = [];
  if (scaleHint != null) {
    for (const k of [0, -1, 1]) scales.push(scaleHint * (1 + k * PARAMS.hintStep));
  } else {
    for (let r = PARAMS.scaleMin; r <= PARAMS.scaleMax + 1e-9; r += PARAMS.scaleStep) scales.push(r);
  }
  const rect = (x0: number, y0: number, x1: number, y1: number) =>
    (S[y1 * W1 + x1] - S[y0 * W1 + x1] - S[y1 * W1 + x0] + S[y0 * W1 + x0]) / ((x1 - x0) * (y1 - y0));
  const bright = new Float64Array(8);
  const gap = new Float64Array(7);
  let best: Candidate | null = null;
  for (const r of scales) {
    const s = s0 * r;
    const h = Math.round((KEY_DY * 4 + GLYPH_H) * s);
    const span = Math.round((KEY_DX * 7 + 6) * s);
    const step = Math.max(1, Math.round(s));
    const above = Math.round(7 * s);
    const below = Math.round(86 * s);
    for (let y = Math.max(above, Math.round((KEY_Y - 14) * s)); y <= Math.round((KEY_Y + 14) * s) && y + below < H; y += step) {
      for (let x = Math.max(0, Math.round((KEY_X - 24) * s)); x <= Math.round((KEY_X + 24) * s) && x + span < W; x += step) {
        let sumB = 0;
        for (let c = 0; c < 8; c++) {
          const x0 = x + Math.round(KEY_DX * c * s);
          bright[c] = rect(x0, y, Math.max(x0 + 1, x0 + Math.round(6 * s)), y + h);
          sumB += bright[c];
        }
        // The pointing hand sits in one gap; ignore the brightest gap.
        let sumG = 0;
        let maxG = 0;
        for (let c = 0; c < 7; c++) {
          const x0 = x + Math.round((KEY_DX * c + 9) * s);
          gap[c] = rect(x0, y, Math.max(x0 + 1, x + Math.round((KEY_DX * c + 21) * s)), y + h);
          sumG += gap[c];
          if (gap[c] > maxG) maxG = gap[c];
        }
        // Black bands between the keyboard box border and the first/last
        // key row fix the height, which the tall columns barely constrain.
        const top = rect(x, y - Math.round(7 * s), x + span, y - Math.max(1, Math.round(2 * s)));
        const bottom = rect(x, y + Math.round(80 * s), x + span, y + Math.round(86 * s));
        const meanB = sumB / 8;
        const contrast = (meanB - (sumG - maxG + top + bottom) / 8) / (meanB + 8);
        if (best == null || contrast > best.score) best = { x: x * f, y: y * f, s: s * f, score: contrast };
      }
    }
  }
  return best;
}

/** Pattern search for the keyboard position and scale maximizing the template correlation. */
export function refineKeyboard(img: ImageDataLike, tm: TerminalModel, c: Candidate): Aligned {
  let { x, y, s } = c;
  // The coarse test cannot tell the keys apart (the pointing hand or the
  // frame next to the keyboard can pass for an extra column) and its tall
  // column boxes pin the height down only loosely, so try one key column
  // over and a +-6 game px vertical range, on a pixel subsample.
  let best = -2;
  for (const dc of [0, -1, 1]) {
    for (let j = -6; j <= 6; j++) {
      for (let i = -1; i <= 1; i++) {
        const sx = c.x + (dc * KEY_DX + i) * s;
        const sy = c.y + j * s;
        const sc = keyboardScore(img, tm, sx, sy, s, 3);
        if (sc > best) {
          best = sc;
          x = sx;
          y = sy;
        }
      }
    }
  }
  best = keyboardScore(img, tm, x, y, s);
  let stepXY = 0.5 * s;
  let stepS = 0.01;
  for (let iter = 0; iter < 60 && stepXY > 0.06 * s; ) {
    let improved = false;
    for (const [dx, dy, ds] of [
      [stepXY, 0, 0],
      [-stepXY, 0, 0],
      [0, stepXY, 0],
      [0, -stepXY, 0],
      [0, 0, stepS],
      [0, 0, -stepS],
    ]) {
      iter++;
      const ns = s * (1 + ds);
      // Scale about the keyboard center so position and scale stay decoupled.
      const nx = x + dx - (ns - s) * KEY_DX * 3.5;
      const ny = y + dy - (ns - s) * KEY_DY * 2;
      const sc = keyboardScore(img, tm, nx, ny, ns);
      if (sc > best) {
        best = sc;
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
  return { x, y, s, score: best };
}

/** Black and white levels measured on the keyboard itself (handles tints and dim streams). */
export function keyboardLevels(img: ImageDataLike, tm: TerminalModel, a: Aligned): { dark: number; bright: number } {
  let sumD = 0;
  let nD = 0;
  let sumB = 0;
  let nB = 0;
  for (let i = 0; i < tm.keyRaw.length; i++) {
    const t = tm.keyRaw[i];
    if (t > 0.05 && t < 0.95) continue;
    const v = sampleV(img, a.x + tm.keyX[i] * a.s, a.y + tm.keyY[i] * a.s);
    if (t <= 0.05) {
      sumD += v;
      nD++;
    } else {
      sumB += v;
      nB++;
    }
  }
  return { dark: sumD / Math.max(nD, 1), bright: sumB / Math.max(nB, 1) };
}
