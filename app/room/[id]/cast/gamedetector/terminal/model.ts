/**
 * Reference data for the terminal detector, built once from the generated
 * font and "CODE ACCEPTED!" bitmap: the glyphs, the keyboard template and the
 * ACCEPTED template, blurred like a stream.
 */

import { ACCEPTED_BITS, ACCEPTED_H, ACCEPTED_W } from "../generated/terminalAccepted";
import { TERMINAL_GLYPH_ROWS, TERMINAL_GLYPHS } from "../generated/terminalFont";
import { ACCEPTED_DX, ACCEPTED_DY, CELL_PX, CELL_W, GLYPH_H, KEY_DX, KEY_DY, KEYBOARD } from "./geometry";

/** Blur of the stream relative to the game pixels, measured on the terminal screenshots. */
const GLYPH_BLUR = 0.55;

export type TerminalModel = {
  /** Blurred glyphs, 0-1: [glyph * CELL_PX + y * CELL_W + x]. */
  glyph: Float32Array;
  /** Keyboard template: sample offsets from 'A' (game px) and centered values. */
  keyX: Float32Array;
  keyY: Float32Array;
  keyT: Float32Array;
  /** Raw blurred keyboard values, for the black/white levels. */
  keyRaw: Float32Array;
  /** "CODE ACCEPTED!" template, same layout as the keyboard template. */
  accX: Float32Array;
  accY: Float32Array;
  accT: Float32Array;
};

let terminalModel: TerminalModel | null = null;

/** Separable Gaussian blur with black outside the w*h image. */
function blurZero(src: Float32Array, w: number, h: number, sigma: number): Float32Array {
  const r = Math.ceil(sigma * 3);
  const k = new Float32Array(2 * r + 1);
  let sum = 0;
  for (let i = -r; i <= r; i++) sum += k[i + r] = Math.exp((-i * i) / (2 * sigma * sigma));
  for (let i = 0; i < k.length; i++) k[i] /= sum;
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let i = -r; i <= r; i++) if (x + i >= 0 && x + i < w) v += k[i + r] * src[y * w + x + i];
      tmp[y * w + x] = v;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let i = -r; i <= r; i++) if (y + i >= 0 && y + i < h) v += k[i + r] * tmp[(y + i) * w + x];
      out[y * w + x] = v;
    }
  }
  return out;
}

export function getTerminalModel(): TerminalModel {
  if (terminalModel != null) return terminalModel;
  const n = TERMINAL_GLYPHS.length;
  const glyph = new Float32Array(n * CELL_PX);
  for (let g = 0; g < n; g++) {
    const bits = new Float32Array(CELL_PX);
    for (let y = 0; y < GLYPH_H; y++) {
      const byte = parseInt(TERMINAL_GLYPH_ROWS.substr((g * GLYPH_H + y) * 2, 2), 16);
      for (let x = 0; x < CELL_W; x++) bits[y * CELL_W + x] = (byte >> (7 - x)) & 1;
    }
    glyph.set(blurZero(bits, CELL_W, GLYPH_H, GLYPH_BLUR), g * CELL_PX);
  }
  const keyX: number[] = [];
  const keyY: number[] = [];
  const keyRaw: number[] = [];
  KEYBOARD.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      const g = TERMINAL_GLYPHS.indexOf(row[c]);
      for (let i = 0; i < CELL_PX; i++) {
        keyX.push(KEY_DX * c + (i % CELL_W) - 1 + 0.5);
        keyY.push(KEY_DY * r + Math.floor(i / CELL_W) + 0.5);
        keyRaw.push(glyph[g * CELL_PX + i]);
      }
    }
  });
  const mean = keyRaw.reduce((a, b) => a + b, 0) / keyRaw.length;
  const keyT = Float32Array.from(keyRaw, (v) => v - mean);
  const accBits = Float32Array.from(ACCEPTED_BITS, (b) => (b === "1" ? 1 : 0));
  const accBlur = blurZero(accBits, ACCEPTED_W, ACCEPTED_H, GLYPH_BLUR);
  const accMean = accBlur.reduce((a, b) => a + b, 0) / accBlur.length;
  terminalModel = {
    glyph,
    keyX: Float32Array.from(keyX),
    keyY: Float32Array.from(keyY),
    keyT,
    keyRaw: Float32Array.from(keyRaw),
    accX: Float32Array.from(accBlur, (_, i) => ACCEPTED_DX + (i % ACCEPTED_W) + 0.5),
    accY: Float32Array.from(accBlur, (_, i) => ACCEPTED_DY + Math.floor(i / ACCEPTED_W) + 0.5),
    accT: Float32Array.from(accBlur, (v) => v - accMean),
  };
  return terminalModel;
}
