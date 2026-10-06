/**
 * Reading the terminal: the characters in the input field, and whether the
 * right panel shows "CODE ACCEPTED!".
 */

import { TERMINAL_GLYPHS } from "../generated/terminalFont";
import { sampleV } from "../imageMath";
import { PARAMS } from "../params";
import type { Aligned, ImageDataLike } from "../types";
import { CELL_PX, CELL_W, DASH_CELL, GLYPH_H, INPUT_CELLS, INPUT_DX, INPUT_DY } from "./geometry";
import type { TerminalModel } from "./model";

const cellObs = new Float32Array(CELL_PX);

/** Best and runner-up glyph of one input cell, with the evidence between them and the best fit's error. */
export type CellReading = { best: string; second: string; evidence: number; error: number };

/**
 * Read the input field. Each cell is compared with every glyph; the best one
 * must fit well and must win clearly on the pixels where it differs from the
 * runner-up (S/5 or O/D differ in only a couple of pixels). Cells that do not
 * read as '~'. `cells` receives the reading of every character cell.
 */
export function readInput(
  img: ImageDataLike,
  tm: TerminalModel,
  a: Aligned,
  dark: number,
  bright: number,
  cells?: CellReading[],
): string {
  const range = Math.max(bright - dark, 1);
  let text = "";
  const d = 0.22;
  for (let cell = 0; cell < INPUT_CELLS; cell++) {
    if (cell === DASH_CELL) {
      text += "-";
      continue;
    }
    const ox = a.x + (INPUT_DX + CELL_W * cell - 1) * a.s;
    const oy = a.y + INPUT_DY * a.s;
    for (let py = 0; py < GLYPH_H; py++) {
      for (let px = 0; px < CELL_W; px++) {
        let v = 0;
        for (let k = 0; k < 4; k++) {
          v += sampleV(img, ox + (px + 0.5 + (k & 1 ? d : -d)) * a.s, oy + (py + 0.5 + (k & 2 ? d : -d)) * a.s);
        }
        cellObs[py * CELL_W + px] = (v / 4 - dark) / range;
      }
    }
    let g1 = -1;
    let g2 = -1;
    let e1 = Infinity;
    let e2 = Infinity;
    for (let g = 0; g < TERMINAL_GLYPHS.length; g++) {
      const ch = TERMINAL_GLYPHS[g];
      if (ch === "-") continue;
      let e = 0;
      const base = g * CELL_PX;
      for (let i = 0; i < CELL_PX; i++) {
        const diff = cellObs[i] - tm.glyph[base + i];
        e += diff * diff;
      }
      if (e < e1) {
        g2 = g1;
        e2 = e1;
        g1 = g;
        e1 = e;
      } else if (e < e2) {
        g2 = g;
        e2 = e;
      }
    }
    let sep = 0;
    for (let i = 0; i < CELL_PX; i++) {
      const diff = tm.glyph[g1 * CELL_PX + i] - tm.glyph[g2 * CELL_PX + i];
      sep += diff * diff;
    }
    const evidence = sep > 1e-6 ? (e2 - e1) / sep : 0;
    const ok = e1 / CELL_PX <= PARAMS.glyphMaxError && evidence >= PARAMS.glyphMinEvidence;
    text += ok ? TERMINAL_GLYPHS[g1] : "~";
    cells?.push({ best: TERMINAL_GLYPHS[g1], second: TERMINAL_GLYPHS[g2], evidence, error: e1 / CELL_PX });
  }
  return text;
}

/** Correlation of the right panel with the "CODE ACCEPTED!" message. */
export function acceptedScore(img: ImageDataLike, tm: TerminalModel, a: Aligned): number {
  const n = tm.accT.length;
  const obs = new Float32Array(n);
  let mean = 0;
  for (let i = 0; i < n; i++) {
    obs[i] = sampleV(img, a.x + tm.accX[i] * a.s, a.y + tm.accY[i] * a.s);
    mean += obs[i];
  }
  mean /= n;
  let cov = 0;
  let ss = 0;
  let tt = 0;
  for (let i = 0; i < n; i++) {
    const d = obs[i] - mean;
    cov += d * tm.accT[i];
    ss += d * d;
    tt += tm.accT[i] * tm.accT[i];
  }
  return ss > 1e-6 && tt > 1e-6 ? cov / Math.sqrt(ss * tt) : 0;
}
