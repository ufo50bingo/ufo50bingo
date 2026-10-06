/**
 * Art match: the label art is sampled on the game-pixel grid and compared
 * against the 50 reference arts with the per-channel invariant correlation.
 * A fallback that ignores the worst-fitting quarter of the pixels handles art
 * partly covered by smoke or Discord's LIVE badge.
 */

import { r2, sample, stats } from "../imageMath";
import type { Aligned, ImageDataLike } from "../types";
import { ART_N, ART_PX, ART_X, ART_Y } from "./geometry";
import { NG } from "./model";
import type { CartridgeModel } from "./model";

const artObs = new Float32Array(ART_PX * 3);
const tmp3 = new Float32Array(3);
const tmpMean = new Float32Array(3);
const resid = new Float32Array(ART_PX);
const residSorted = new Float32Array(ART_PX);
/** Candidates re-scored with the occlusion-tolerant error. */
const TOP_K = 6;
/** Share of worst-fitting pixels ignored by the occlusion-tolerant error. */
const TRIM = 0.25;

/** Best and runner-up errors (1 - R^2); games are indices into GAMES. */
export type ArtMatch = {
  game: number;
  err: number;
  err2: number;
  /** Same, but with the worst-fitting 25% of pixels ignored (smoke, LIVE badge). */
  tGame: number;
  tErr: number;
  tErr2: number;
};

/**
 * 1 - R^2 after a per-channel gain/offset fit, refit on the (1 - TRIM) share of
 * pixels that fit best, so a covered part of the art does not count.
 */
function trimmedError(m: CartridgeModel, g: number, mean: Float32Array): number {
  const base = g * 3 * ART_PX;
  const gain = tmp3;
  for (let c = 0; c < 3; c++) {
    const tss = m.artSS[g * 3 + c];
    let cov = 0;
    for (let i = 0; i < ART_PX; i++) cov += (artObs[i * 3 + c] - mean[c]) * m.art[base + c * ART_PX + i];
    gain[c] = tss > 1e-6 && cov > 0 ? cov / tss : 0;
  }
  for (let i = 0; i < ART_PX; i++) {
    let r = 0;
    for (let c = 0; c < 3; c++) {
      const d = artObs[i * 3 + c] - mean[c] - gain[c] * m.art[base + c * ART_PX + i];
      r += d * d;
    }
    resid[i] = r;
  }
  residSorted.set(resid);
  residSorted.sort();
  const limit = residSorted[Math.floor(ART_PX * (1 - TRIM)) - 1];
  let explained = 0;
  let total = 0;
  for (let c = 0; c < 3; c++) {
    let n = 0;
    let so = 0;
    let st = 0;
    for (let i = 0; i < ART_PX; i++) {
      if (resid[i] > limit) continue;
      n++;
      so += artObs[i * 3 + c];
      st += m.art[base + c * ART_PX + i];
    }
    const mo = so / n;
    const mt = st / n;
    let cov = 0;
    let tss = 0;
    for (let i = 0; i < ART_PX; i++) {
      if (resid[i] > limit) continue;
      const o = artObs[i * 3 + c] - mo;
      const t = m.art[base + c * ART_PX + i] - mt;
      cov += o * t;
      tss += t * t;
      total += o * o;
    }
    if (tss > 1e-6 && cov > 0) explained += (cov * cov) / tss;
  }
  return total > 1e-6 ? 1 - explained / total : 1;
}

export function matchArt(img: ImageDataLike, m: CartridgeModel, a: Aligned): ArtMatch {
  const { x, y, s } = a;
  // Average 4 samples inside each game pixel to suppress compression noise.
  const d = 0.22;
  for (let gy = 0; gy < ART_N; gy++) {
    for (let gx = 0; gx < ART_N; gx++) {
      const o = (gy * ART_N + gx) * 3;
      let r = 0;
      let g = 0;
      let b = 0;
      for (let k = 0; k < 4; k++) {
        const px = x + (ART_X + gx + 0.5 + (k & 1 ? d : -d)) * s;
        const py = y + (ART_Y + gy + 0.5 + (k & 2 ? d : -d)) * s;
        sample(img, px, py, tmp3, 0);
        r += tmp3[0];
        g += tmp3[1];
        b += tmp3[2];
      }
      artObs[o] = r / 4;
      artObs[o + 1] = g / 4;
      artObs[o + 2] = b / 4;
    }
  }
  const ss = stats(artObs, ART_PX, tmpMean);
  // Plain error for every game; keep the TOP_K best in ascending order.
  const topG: number[] = [];
  const topE: number[] = [];
  for (let g = 0; g < NG; g++) {
    const e = 1 - r2(artObs, ART_PX, m.art, g * 3 * ART_PX, m.artSS, g * 3, tmpMean, ss);
    let k = topE.length;
    while (k > 0 && topE[k - 1] > e) k--;
    if (k < TOP_K) {
      topG.splice(k, 0, g);
      topE.splice(k, 0, e);
      if (topG.length > TOP_K) {
        topG.pop();
        topE.pop();
      }
    }
  }
  let tGame = topG[0];
  let tErr = Infinity;
  let tErr2 = Infinity;
  for (const g of topG) {
    const e = trimmedError(m, g, tmpMean);
    if (e < tErr) {
      tErr2 = tErr;
      tErr = e;
      tGame = g;
    } else if (e < tErr2) {
      tErr2 = e;
    }
  }
  return { game: topG[0], err: topE[0], err2: topE[1], tGame, tErr, tErr2 };
}
