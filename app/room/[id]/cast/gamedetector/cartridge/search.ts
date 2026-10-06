/**
 * Coarse cartridge search: every position and scale is tested on the integral
 * image for the cartridge's color-independent structure (its 1px black
 * outline, bright frame strips and dark label slot) with a few O(1) box sums.
 * The hits are seeds for fine alignment (align.ts).
 */

import type { Integral } from "../imageMath";
import { PARAMS } from "../params";
import { screenScale } from "../screen";
import type { Candidate } from "../types";
import { BADGE_ZONE_X, BADGE_ZONE_Y, CH, CW } from "./geometry";

// Box regions in game px relative to the cartridge's top-left corner: [x0, y0, x1, y1].
// Dark boxes are thin boxes centered on the cartridge's own 1px black outline
// and on its label slot; each is evaluated at 3 sub-pixel shifts across the
// line (dx or dy) and the darkest wins, so a coarse position grid still lands
// on the line. Bright boxes are kept narrower than the strips they sample for
// the same reason. The drop shadow is ignored because its color depends on the
// library background theme.
// The right outline is split because the LIVE badge can cover the top-right
// corner of a cartridge sitting in the top-right library slot.
const DARK = [
  [29.15, 16, 29.85, 30, 1, 0], // right outline, lower half (shift in x)
  [29.15, 3, 29.85, 16, 1, 0], // right outline, upper half
  [0.15, 10, 0.85, 30, 1, 0], // left outline
  [3, 33.15, 18, 33.85, 0, 1], // bottom outline (shift in y)
  [18.3, 26.15, 22.7, 26.85, 0, 1], // label slot
];
const BRIGHT = [
  [27.25, 3, 28.75, 24], // right frame
  [1.25, 11, 2.75, 24], // left frame
  [2.5, 26.5, 5.5, 30.5], // label, left block
  [24.5, 26.5, 27.5, 30.5], // label, right block
];
// Wide boxes over the right outline for a cheap first rejection test: full
// height, or only the lower half inside the LIVE badge corner.
const PRETEST = [28.85, 3, 30.15, 30];
const PRETEST_LOWER = [28.85, 16, 30.15, 30];
const SHIFT = 0.45;
const N_BOX = 2 + DARK.length * 3 + BRIGHT.length;

const boxOff = new Int32Array(N_BOX * 4);
const boxInv = new Float64Array(N_BOX);

function setBox(k: number, rect: number[], dx: number, dy: number, s: number, W1: number) {
  const x0 = Math.round((rect[0] + dx) * s);
  const y0 = Math.round((rect[1] + dy) * s);
  const x1 = Math.max(x0 + 1, Math.round((rect[2] + dx) * s));
  const y1 = Math.max(y0 + 1, Math.round((rect[3] + dy) * s));
  boxOff[k * 4] = y0 * W1 + x0;
  boxOff[k * 4 + 1] = y0 * W1 + x1;
  boxOff[k * 4 + 2] = y1 * W1 + x0;
  boxOff[k * 4 + 3] = y1 * W1 + x1;
  boxInv[k] = 1 / ((x1 - x0) * (y1 - y0));
}

/**
 * Seeds (in input pixels) for cartridges, several per cartridge. `stopEarly`
 * gets the best few hits once there are many, and can end the search when
 * they confirm the library.
 */
export function coarseCandidates(
  integ: Integral,
  stopEarly?: (top: Candidate[]) => boolean,
  scaleHint?: number,
): { seeds: Candidate[]; stopped: boolean } {
  const { S, W, H, f } = integ;
  const W1 = W + 1;
  const s0 = screenScale(W, H);
  const nD = DARK.length;
  const firstBright = 2 + nD * 3;
  const hits: Candidate[] = [];
  const minC = PARAMS.coarseMinContrast;
  const maxRatio = PARAMS.coarseMaxDarkRatio;
  const off = boxOff;
  const inv = boxInv;
  const box = (k: number, base: number) =>
    (S[base + off[k * 4 + 3]] - S[base + off[k * 4 + 1]] - S[base + off[k * 4 + 2]] + S[base + off[k * 4]]) *
    inv[k];
  const dark = (k: number, base: number) => {
    const j = 2 + k * 3;
    const v0 = box(j, base);
    const v1 = box(j + 1, base);
    const v2 = box(j + 2, base);
    return v0 < v1 ? (v0 < v2 ? v0 : v2) : v1 < v2 ? v1 : v2;
  };
  // Most likely scales first, so a library frame can bail out early.
  const scales: number[] = [];
  if (scaleHint != null) {
    for (const k of [0, -1, 1]) scales.push(scaleHint * (1 + k * PARAMS.hintStep));
  } else {
    for (let r = PARAMS.scaleMin; r <= PARAMS.scaleMax + 1e-9; r += PARAMS.scaleStep) scales.push(r);
    scales.sort((a, b) => Math.abs(a - 1) - Math.abs(b - 1));
  }
  const seedRadius = 3.5 * s0;
  const clusterRadius = 14 * s0;
  let earlyChecks = 0;
  for (const r of scales) {
    const s = s0 * r;
    setBox(0, PRETEST, 0, 0, s, W1);
    setBox(1, PRETEST_LOWER, 0, 0, s, W1);
    for (let k = 0; k < nD; k++) {
      const rect = DARK[k];
      for (let j = 0; j < 3; j++) {
        const t = (j - 1) * SHIFT;
        setBox(2 + k * 3 + j, rect, rect[4] * t, rect[5] * t, s, W1);
      }
    }
    for (let k = 0; k < BRIGHT.length; k++) setBox(firstBright + k, BRIGHT[k], 0, 0, s, W1);
    const p0 = off[0], p1 = off[1], p2 = off[2], p3 = off[3];
    const l0 = off[4], l1 = off[5], l2 = off[6], l3 = off[7];
    const q0 = off[firstBright * 4], q1 = off[firstBright * 4 + 1];
    const q2 = off[firstBright * 4 + 2], q3 = off[firstBright * 4 + 3];
    const invP = inv[0];
    const invL = inv[1];
    const zoneX = BADGE_ZONE_X * W - 15 * s;
    const zoneY = BADGE_ZONE_Y * H - 17 * s;
    const invQ = inv[firstBright];
    const step = s * PARAMS.coarseStep;
    const nx = Math.floor((W - CW * s) / step);
    const ny = Math.floor((H - CH * s) / step);
    for (let j = 0; j <= ny; j++) {
      const y = Math.round(j * step);
      for (let i = 0; i <= nx; i++) {
        const x = Math.round(i * step);
        const base = y * W1 + x;
        // Pre-test: right frame strip must be clearly brighter than the area
        // around the right outline. Rejects ~94% of positions with 8 reads.
        const b0 = (S[base + q3] - S[base + q1] - S[base + q2] + S[base + q0]) * invQ;
        const zone = x > zoneX && y < zoneY;
        const dw = zone
          ? (S[base + l3] - S[base + l1] - S[base + l2] + S[base + l0]) * invL
          : (S[base + p3] - S[base + p1] - S[base + p2] + S[base + p0]) * invP;
        if (dw > 0.8 * b0 || b0 - dw < 10) continue;
        // The lower right outline sits next to the drop shadow, so it survives
        // blur and compression: require it.
        const dR = dark(0, base);
        if (b0 - dR < minC || dR > maxRatio * b0) continue;
        let minB = b0;
        for (let k = firstBright + 1; k < N_BOX; k++) {
          const v = box(k, base);
          if (v < minB) minB = v;
        }
        // The thin outlines and the slot can vanish under heavy compression or
        // be covered by smoke or the LIVE badge: tolerate one failing dark box.
        let maxD = dR;
        let maxD2 = -1;
        for (let k = 1; k < nD; k++) {
          const v = dark(k, base);
          if (v > maxD) {
            maxD2 = maxD;
            maxD = v;
          } else if (v > maxD2) {
            maxD2 = v;
          }
        }
        // Under the badge the hidden box is bright, so only bound it elsewhere.
        if (minB - maxD2 < minC || maxD2 > maxRatio * minB || (!zone && maxD > 0.95 * minB)) continue;
        hits.push({ x, y, s, score: (minB - 0.5 * (maxD + maxD2)) / (minB + 1) });
      }
    }
    // Many separate hits at the most likely scales usually means the library
    // grid; let the caller confirm with a few fine checks and stop early.
    if (
      stopEarly != null &&
      earlyChecks < 2 &&
      suppress(hits.slice(), clusterRadius, PARAMS.libraryHits + 1).length > PARAMS.libraryHits
    ) {
      earlyChecks++;
      if (stopEarly(toInput(suppress(hits.slice(), clusterRadius, 3), f))) return { seeds: [], stopped: true };
    }
  }
  // Several seeds per cartridge: a false seed can outscore the true one.
  return { seeds: toInput(suppress(hits, seedRadius, 4 * PARAMS.maxVerify), f), stopped: false };
}

function toInput(hits: Candidate[], f: number): Candidate[] {
  return hits.map((h) => ({ x: h.x * f, y: h.y * f, s: h.s * f, score: h.score }));
}

/** Non-maximum suppression: best candidates at least `radius` apart. */
function suppress(hits: Candidate[], radius: number, limit: number): Candidate[] {
  hits.sort((a, b) => b.score - a.score);
  const kept: Candidate[] = [];
  for (const h of hits) {
    let ok = true;
    for (const k of kept) {
      if (Math.abs(k.x - h.x) < radius && Math.abs(k.y - h.y) < radius) {
        ok = false;
        break;
      }
    }
    if (ok) {
      kept.push(h);
      if (kept.length >= limit) break;
    }
  }
  return kept;
}
