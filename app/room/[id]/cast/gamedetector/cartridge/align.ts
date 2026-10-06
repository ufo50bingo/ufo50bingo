/**
 * Fine alignment: sub-pixel search maximizing the match of the sampled frame
 * pixels with the 5 cartridge templates (per-channel gain/offset invariant,
 * so tinted or washed-out streams still match).
 */

import { r2, sample, stats } from "../imageMath";
import { PARAMS } from "../params";
import type { Aligned, Candidate, ImageDataLike } from "../types";
import { CH, CW } from "./geometry";
import { NV } from "./model";
import type { CartridgeModel } from "./model";

let frameObs = new Float32Array(0);
const tmpMean = new Float32Array(3);

/**
 * Samples the frame template pixels (interleaved RGB) for a cart at (x, y)
 * with scale s. Returns a shared buffer that the next call overwrites.
 */
export function sampleFrame(img: ImageDataLike, m: CartridgeModel, x: number, y: number, s: number): Float32Array {
  const n = m.frameX.length;
  if (frameObs.length < n * 3) frameObs = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) sample(img, x + m.frameX[i] * s, y + m.frameY[i] * s, frameObs, i * 3);
  return frameObs;
}

/** Best frame-template similarity over the variants for a cart at (x, y) with scale s. */
export function frameScore(img: ImageDataLike, m: CartridgeModel, x: number, y: number, s: number): number {
  const n = m.frameX.length;
  const obs = sampleFrame(img, m, x, y, s);
  const ss = stats(obs, n, tmpMean);
  let best = 0;
  for (let v = 0; v < NV; v++) {
    const sc = r2(obs, n, m.frame, v * 3 * n, m.frameSS, v * 3, tmpMean, ss);
    if (sc > best) best = sc;
  }
  return best;
}

/**
 * Pattern search over (x, y, scale) starting from a coarse hit. The frame
 * score's basin is only about +-0.5 game px wide, so a +-`scan` px grid at
 * 1 game px spacing picks the starting point.
 */
export function refine(img: ImageDataLike, m: CartridgeModel, c: Candidate, maxIter = 40, scan = 2): Aligned {
  let { x, y } = c;
  const s0 = c.s;
  let best = -1;
  for (let j = -scan; j <= scan; j++) {
    for (let i = -scan; i <= scan; i++) {
      const sc = frameScore(img, m, c.x + i * s0, c.y + j * s0, s0);
      if (sc > best) {
        best = sc;
        x = c.x + i * s0;
        y = c.y + j * s0;
      }
    }
  }
  let s = s0;
  if (best < PARAMS.seedMinScore) return { x, y, s, score: best };
  let stepXY = 0.5 * s;
  let stepS = 0.02;
  let iter = 0;
  while (iter < maxIter && stepXY > 0.1 * s) {
    let improved = false;
    const moves: [number, number, number][] = [
      [stepXY, 0, 0],
      [-stepXY, 0, 0],
      [0, stepXY, 0],
      [0, -stepXY, 0],
      [0, 0, stepS],
      [0, 0, -stepS],
    ];
    for (const [dx, dy, ds] of moves) {
      iter++;
      const ns = s * (1 + ds);
      // Scale about the cartridge center so x/y and scale are less coupled.
      const nx = x + dx - (ns - s) * CW * 0.5;
      const ny = y + dy - (ns - s) * CH * 0.5;
      const sc = frameScore(img, m, nx, ny, ns);
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
