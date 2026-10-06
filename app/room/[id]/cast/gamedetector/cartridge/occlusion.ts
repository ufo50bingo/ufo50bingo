/**
 * Cartridges partly covered by Discord's LIVE badge (top-right library slots):
 * a lenient frame check for them, and an estimate of how much art is hidden.
 */

import { r2, stats } from "../imageMath";
import { PARAMS } from "../params";
import type { Aligned, ImageDataLike } from "../types";
import { sampleFrame } from "./align";
import { ART_N, ART_X, ART_Y, inBadgeZone } from "./geometry";
import { NV } from "./model";
import type { CartridgeModel } from "./model";

const frameResid = new Float32Array(1024);
const frameResidSorted = new Float32Array(1024);
const tmpMean = new Float32Array(3);
const tmpGain = new Float32Array(3);

/**
 * Frame-template score ignoring the worst-fitting `trim` share of frame
 * pixels, for cartridges partly under the LIVE badge.
 */
function trimmedFrameScore(img: ImageDataLike, m: CartridgeModel, a: Aligned, trim: number): number {
  const n = m.frameX.length;
  const frameObs = sampleFrame(img, m, a.x, a.y, a.s);
  stats(frameObs, n, tmpMean);
  let best = 0;
  for (let v = 0; v < NV; v++) {
    const base = v * 3 * n;
    const gain = tmpGain;
    for (let c = 0; c < 3; c++) {
      const tss = m.frameSS[v * 3 + c];
      let cov = 0;
      for (let i = 0; i < n; i++) cov += (frameObs[i * 3 + c] - tmpMean[c]) * m.frame[base + c * n + i];
      gain[c] = tss > 1e-6 && cov > 0 ? cov / tss : 0;
    }
    for (let i = 0; i < n; i++) {
      let r = 0;
      for (let c = 0; c < 3; c++) {
        const d = frameObs[i * 3 + c] - tmpMean[c] - gain[c] * m.frame[base + c * n + i];
        r += d * d;
      }
      frameResid[i] = r;
    }
    const sorted = frameResidSorted.subarray(0, n);
    sorted.set(frameResid.subarray(0, n));
    sorted.sort();
    const limit = sorted[Math.floor(n * (1 - trim)) - 1];
    let explained = 0;
    let total = 0;
    for (let c = 0; c < 3; c++) {
      let k = 0;
      let so = 0;
      let st = 0;
      for (let i = 0; i < n; i++) {
        if (frameResid[i] > limit) continue;
        k++;
        so += frameObs[i * 3 + c];
        st += m.frame[base + c * n + i];
      }
      const mo = so / k;
      const mt = st / k;
      let cov = 0;
      let tss = 0;
      for (let i = 0; i < n; i++) {
        if (frameResid[i] > limit) continue;
        const o = frameObs[i * 3 + c] - mo;
        const t = m.frame[base + c * n + i] - mt;
        cov += o * t;
        tss += t * t;
        total += o * o;
      }
      if (tss > 1e-6 && cov > 0) explained += (cov * cov) / tss;
    }
    if (total > 1e-6 && explained / total > best) best = explained / total;
  }
  return best;
}

/** Frame check for a refined candidate; partly covered frames pass in the LIVE badge corner. */
export function isCartridge(img: ImageDataLike, m: CartridgeModel, a: Aligned): boolean {
  if (a.score >= PARAMS.frameMinScore) return true;
  return (
    a.score >= PARAMS.seedMinScore &&
    inBadgeZone(img, a) &&
    trimmedFrameScore(img, m, a, PARAMS.badgeFrameTrim) >= PARAMS.frameMinScore
  );
}

/**
 * Estimated share of the art window hidden by something that covers the
 * cartridge from outside, i.e. the LIVE badge. Anything that reaches
 * the art must cross the frame around it, so frame pixels that fit the
 * template badly reveal which art rows (left/right borders) and columns
 * (top/bottom borders) are covered. Color-agnostic on purpose: the badge red
 * also appears in UFO 50 backgrounds and art.
 */
export function occludedShare(img: ImageDataLike, m: CartridgeModel, a: Aligned): number {
  const n = m.frameX.length;
  const frameObs = sampleFrame(img, m, a.x, a.y, a.s);
  const ss = stats(frameObs, n, tmpMean);
  let bestV = 0;
  let best = -1;
  for (let v = 0; v < NV; v++) {
    const sc = r2(frameObs, n, m.frame, v * 3 * n, m.frameSS, v * 3, tmpMean, ss);
    if (sc > best) {
      best = sc;
      bestV = v;
    }
  }
  const base = bestV * 3 * n;
  const gain = [0, 0, 0];
  for (let c = 0; c < 3; c++) {
    const tss = m.frameSS[bestV * 3 + c];
    let cov = 0;
    for (let i = 0; i < n; i++) cov += (frameObs[i * 3 + c] - tmpMean[c]) * m.frame[base + c * n + i];
    gain[c] = tss > 1e-6 && cov > 0 ? cov / tss : 0;
  }
  for (let i = 0; i < n; i++) {
    let r = 0;
    for (let c = 0; c < 3; c++) {
      const d = frameObs[i * 3 + c] - tmpMean[c] - gain[c] * m.frame[base + c * n + i];
      r += d * d;
    }
    frameResid[i] = r;
  }
  // A frame pixel is "covered" if its residual is large relative to the
  // spread of the observed frame colors.
  const limit = PARAMS.occlusionResidual * (ss / n);
  const rows = new Uint8Array(ART_N);
  const cols = new Uint8Array(ART_N);
  for (let i = 0; i < n; i++) {
    if (frameResid[i] <= limit) continue;
    const fx = m.frameX[i] - 0.5;
    const fy = m.frameY[i] - 0.5;
    if ((fx === 1 || fx === 2 || fx === 27 || fx === 28) && fy >= ART_Y && fy < ART_Y + ART_N) rows[fy - ART_Y] = 1;
    if ((fy === 0 || fy === ART_Y + ART_N) && fx >= ART_X && fx < ART_X + ART_N) cols[fx - ART_X] = 1;
  }
  // Ignore isolated hits; a real occluder edge spans several pixels.
  const runs = (flags: Uint8Array) => {
    let count = 0;
    for (let i = 0; i < ART_N; i++) {
      if (flags[i] && ((i > 0 && flags[i - 1]) || (i + 1 < ART_N && flags[i + 1]))) count++;
    }
    return count / ART_N;
  };
  const fr = runs(rows);
  const fc = runs(cols);
  // Covered rows and columns: a corner rectangle; only one kind: full bands.
  return fr > 0 && fc > 0 ? fr * fc : Math.max(fr, fc);
}
