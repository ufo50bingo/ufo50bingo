/**
 * Pixel sampling, the color-invariant match score and the integral image,
 * shared by the cartridge and terminal detectors.
 */

import { screenScale } from "./screen";
import type { ImageDataLike } from "./types";

/** Bilinear RGB sample at continuous pixel coordinates (pixel centers at +0.5). */
export function sample(img: ImageDataLike, x: number, y: number, out: Float32Array, o: number) {
  const { data, width: W, height: H } = img;
  let fx = x - 0.5;
  let fy = y - 0.5;
  if (fx < 0) fx = 0;
  else if (fx > W - 1) fx = W - 1;
  if (fy < 0) fy = 0;
  else if (fy > H - 1) fy = H - 1;
  const x0 = fx | 0;
  const y0 = fy | 0;
  const ax = fx - x0;
  const ay = fy - y0;
  const dx = x0 + 1 < W ? 4 : 0;
  const dy = y0 + 1 < H ? W * 4 : 0;
  const i = (y0 * W + x0) * 4;
  const w00 = (1 - ax) * (1 - ay);
  const w10 = ax * (1 - ay);
  const w01 = (1 - ax) * ay;
  const w11 = ax * ay;
  for (let c = 0; c < 3; c++) {
    out[o + c] =
      data[i + c] * w00 + data[i + dx + c] * w10 + data[i + dy + c] * w01 + data[i + dx + dy + c] * w11;
  }
}

const tmp3 = new Float32Array(3);

/** Bilinear max(R,G,B) at continuous pixel coordinates (pixel centers at +0.5). */
export function sampleV(img: ImageDataLike, x: number, y: number): number {
  sample(img, x, y, tmp3, 0);
  return tmp3[0] > tmp3[1] ? (tmp3[0] > tmp3[2] ? tmp3[0] : tmp3[2]) : tmp3[1] > tmp3[2] ? tmp3[1] : tmp3[2];
}

/**
 * Per-channel gain/offset invariant similarity of observed samples vs a
 * centered template: sum_c max(0, cov_c)^2 / var_t,c divided by sum_c var_o,c.
 * `obs` is interleaved RGB (n*3), `tpl` is planar ((3*n) at `base`).
 */
export function r2(
  obs: Float32Array,
  n: number,
  tpl: Float32Array,
  base: number,
  tplSS: Float32Array,
  ssBase: number,
  obsMean: Float32Array,
  obsSS: number,
): number {
  if (obsSS <= 1e-6) return 0;
  let explained = 0;
  for (let c = 0; c < 3; c++) {
    const tss = tplSS[ssBase + c];
    if (tss <= 1e-6) continue;
    const tb = base + c * n;
    const m = obsMean[c];
    let cov = 0;
    for (let i = 0; i < n; i++) cov += (obs[i * 3 + c] - m) * tpl[tb + i];
    if (cov > 0) explained += (cov * cov) / tss;
  }
  return explained / obsSS;
}

/** Per-channel means of interleaved RGB samples (into `mean`); returns the sum of squares about them. */
export function stats(obs: Float32Array, n: number, mean: Float32Array): number {
  let ss = 0;
  for (let c = 0; c < 3; c++) {
    let m = 0;
    for (let i = 0; i < n; i++) m += obs[i * 3 + c];
    m /= n;
    mean[c] = m;
    for (let i = 0; i < n; i++) {
      const d = obs[i * 3 + c] - m;
      ss += d * d;
    }
  }
  return ss;
}

/** max(R,G,B) integral image on a grid of every `f`-th input pixel. */
export type Integral = { S: Float64Array; W: number; H: number; f: number };

let integral = new Float64Array(0);

/**
 * Integral image of max(R,G,B), point-sampled every `f` pixels. Large frames
 * keep at least ~1.8 samples per game pixel, which is all the coarse tests need.
 */
function buildIntegral(img: ImageDataLike, f: number, W: number, H: number): Float64Array {
  const { data, width } = img;
  const W1 = W + 1;
  if (integral.length < W1 * (H + 1)) integral = new Float64Array(W1 * (H + 1));
  const S = integral;
  const half = f >> 1;
  for (let x = 0; x <= W; x++) S[x] = 0;
  for (let y = 0; y < H; y++) {
    let row = 0;
    const o = (y + 1) * W1;
    S[o] = 0;
    let p = ((y * f + half) * width + half) * 4;
    const dp = f * 4;
    for (let x = 0; x < W; x++, p += dp) {
      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];
      row += r > g ? (r > b ? r : b) : g > b ? g : b;
      S[o + x + 1] = S[o - W1 + x + 1] + row;
    }
  }
  return S;
}

/** The integral image of a frame. Its buffer is reused by the next call. */
export function integralImage(img: ImageDataLike): Integral {
  const f = Math.max(1, Math.floor(screenScale(img.width, img.height) / 1.8));
  const W = Math.floor(img.width / f);
  const H = Math.floor(img.height / f);
  return { S: buildIntegral(img, f, W, H), W, H, f };
}
