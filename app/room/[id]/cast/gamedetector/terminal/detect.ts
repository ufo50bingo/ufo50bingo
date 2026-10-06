/**
 * Terminal codes on one frame: find the keyboard, read the input field and
 * look the code up in the generated code table. A mistyped code is not listed
 * and never shows "CODE ACCEPTED!", so it never names a game.
 */

import { TERMINAL_CODES } from "../../terminalCodes";
import type { Integral } from "../imageMath";
import { PARAMS } from "../params";
import { screenScale } from "../screen";
import type { FrameResult, ImageDataLike } from "../types";
import { findKeyboard, keyboardLevels, refineKeyboard } from "./keyboard";
import { CODE_CHARS, DASH_CELL } from "./geometry";
import { getTerminalModel } from "./model";
import { acceptedScore, readInput } from "./read";
import type { CellReading } from "./read";

/** The terminal result for this frame, or null if it does not show the terminal. */
export function detectTerminal(img: ImageDataLike, integ: Integral, scaleHint?: number): FrameResult | null {
  const coarse = findKeyboard(integ, scaleHint);
  if (coarse == null || coarse.score < PARAMS.keyboardMinContrast) return null;
  const tm = getTerminalModel();
  const a = refineKeyboard(img, tm, coarse);
  if (a.score < PARAMS.keyboardMinScore) return null;
  const { dark, bright } = keyboardLevels(img, tm, a);
  const cells: CellReading[] = [];
  const text = readInput(img, tm, a, dark, bright, cells);
  const accepted = acceptedScore(img, tm, a);
  const isCode = (t: string) => [...t].every((ch, i) => (i === DASH_CELL ? ch === "-" : CODE_CHARS.includes(ch)));
  let code = isCode(text) ? text : null;
  if (code == null && accepted >= PARAMS.acceptedMinScore && !/[_*]/.test(text)) {
    // The game accepted the code but a look-alike glyph (O/D, S/5) was not
    // read confidently: take the only listed code that agrees with every
    // confident cell and one of the two best glyphs of each uncertain cell.
    const options = cells.map((c, i) => (text[i < DASH_CELL ? i : i + 1] === "~" ? c.best + c.second : c.best));
    const matches = Object.keys(TERMINAL_CODES).filter((k) =>
      options.every((opt, i) => opt.includes(k[i < DASH_CELL ? i : i + 1])),
    );
    if (matches.length === 1) code = matches[0];
  }
  const game = code != null && code in TERMINAL_CODES ? TERMINAL_CODES[code as keyof typeof TERMINAL_CODES] : null;
  return {
    kind: "terminal",
    code,
    game,
    text,
    keyboardScore: a.score,
    accepted,
    scale: a.s / screenScale(img.width, img.height),
  };
}
