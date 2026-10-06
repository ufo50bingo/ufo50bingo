/**
 * Reference data for the cartridge detector, built once from the generated
 * game art and cartridge templates: the 50 label arts and the frames (every
 * template pixel outside the art window) of the 5 cartridge colors, blurred
 * like a stream and centered for the color-invariant match.
 */

import { ORDERED_PROPER_GAMES } from "@/app/goals";
import { CART_PALETTE, CART_PIXELS, CART_VARIANTS } from "../generated/cartTemplates";
import { ART_PALETTE, ART_PIXELS } from "../generated/gameArt";
import { PARAMS } from "../params";
import { ART_N, ART_PX, ART_X, ART_Y, CH, CW } from "./geometry";

export const NG = ORDERED_PROPER_GAMES.length;
export const NV = CART_VARIANTS.length;

export type CartridgeModel = {
  /** Centered, blurred art: [(game * 3 + channel) * 576 + pixel]. */
  art: Float32Array;
  /** Sum of squares of `art` per (game, channel). */
  artSS: Float32Array;
  /** Frame sample offsets (game px, pixel centers) shared by all variants. */
  frameX: Float32Array;
  frameY: Float32Array;
  /** Centered, blurred frame templates: [(variant * 3 + channel) * n + i]. */
  frame: Float32Array;
  frameSS: Float32Array;
};

let model: CartridgeModel | null = null;

/** Digits of the generated palette indices (base64 order), as in tools/build_model.py. */
const DIGITS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function decode(chars: string, offset: number, count: number): Int32Array {
  const lut = new Int32Array(128).fill(-1);
  for (let i = 0; i < DIGITS.length; i++) lut[DIGITS.charCodeAt(i)] = i;
  const out = new Int32Array(count);
  for (let i = 0; i < count; i++) out[i] = lut[chars.charCodeAt(offset + i)];
  return out;
}

/** Separable Gaussian blur of a w*h single-channel image, ignoring pixels with weight 0. */
function blurMasked(
  src: Float32Array,
  weight: Float32Array,
  w: number,
  h: number,
  sigma: number,
): Float32Array {
  const r = Math.max(1, Math.ceil(sigma * 2.5));
  const k = new Float32Array(2 * r + 1);
  for (let i = -r; i <= r; i++) k[i + r] = Math.exp((-i * i) / (2 * sigma * sigma));
  const pass = (v: Float32Array, wt: Float32Array, horizontal: boolean) => {
    const outV = new Float32Array(w * h);
    const outW = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let sv = 0;
        let sw = 0;
        for (let i = -r; i <= r; i++) {
          const xx = horizontal ? x + i : x;
          const yy = horizontal ? y : y + i;
          if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          const j = yy * w + xx;
          sv += k[i + r] * v[j] * wt[j];
          sw += k[i + r] * wt[j];
        }
        outW[y * w + x] = sw;
        outV[y * w + x] = sw > 0 ? sv / sw : 0;
      }
    }
    return [outV, outW] as const;
  };
  const [v1, w1] = pass(src, weight, true);
  return pass(v1, w1, false)[0];
}

function buildModel(): CartridgeModel {
  const sigma = PARAMS.refBlur;
  const ones = new Float32Array(ART_PX).fill(1);
  const art = new Float32Array(NG * 3 * ART_PX);
  const artSS = new Float32Array(NG * 3);
  const idx = decode(ART_PIXELS, 0, NG * ART_PX);
  for (let g = 0; g < NG; g++) {
    for (let c = 0; c < 3; c++) {
      const plane = new Float32Array(ART_PX);
      for (let i = 0; i < ART_PX; i++) plane[i] = ART_PALETTE[idx[g * ART_PX + i] * 3 + c];
      const b = sigma > 0 ? blurMasked(plane, ones, ART_N, ART_N, sigma) : plane;
      let mean = 0;
      for (let i = 0; i < ART_PX; i++) mean += b[i];
      mean /= ART_PX;
      let ss = 0;
      const base = (g * 3 + c) * ART_PX;
      for (let i = 0; i < ART_PX; i++) {
        const v = b[i] - mean;
        art[base + i] = v;
        ss += v * v;
      }
      artSS[g * 3 + c] = ss;
    }
  }

  // Frame templates: every opaque pixel outside the art window.
  const n0 = CW * CH;
  const cidx = decode(CART_PIXELS, 0, NV * n0);
  const known = new Float32Array(n0);
  for (let y = 0; y < CH; y++) {
    for (let x = 0; x < CW; x++) {
      const inArt = x >= ART_X && x < ART_X + ART_N && y >= ART_Y && y < ART_Y + ART_N;
      known[y * CW + x] = cidx[y * CW + x] !== 0 && !inArt ? 1 : 0;
    }
  }
  const sel: number[] = [];
  for (let i = 0; i < n0; i++) if (known[i]) sel.push(i);
  const n = sel.length;
  const frameX = new Float32Array(n);
  const frameY = new Float32Array(n);
  sel.forEach((p, i) => {
    frameX[i] = (p % CW) + 0.5;
    frameY[i] = Math.floor(p / CW) + 0.5;
  });
  const frame = new Float32Array(NV * 3 * n);
  const frameSS = new Float32Array(NV * 3);
  for (let v = 0; v < NV; v++) {
    for (let c = 0; c < 3; c++) {
      const plane = new Float32Array(n0);
      for (let i = 0; i < n0; i++) {
        const k = cidx[v * n0 + i];
        plane[i] = k === 0 ? 0 : CART_PALETTE[k * 3 + c];
      }
      const b = sigma > 0 ? blurMasked(plane, known, CW, CH, sigma) : plane;
      let mean = 0;
      for (let i = 0; i < n; i++) mean += b[sel[i]];
      mean /= n;
      let ss = 0;
      const base = (v * 3 + c) * n;
      for (let i = 0; i < n; i++) {
        const val = b[sel[i]] - mean;
        frame[base + i] = val;
        ss += val * val;
      }
      frameSS[v * 3 + c] = ss;
    }
  }
  return { art, artSS, frameX, frameY, frame, frameSS };
}

export function getCartridgeModel(): CartridgeModel {
  if (model == null) model = buildModel();
  return model;
}
