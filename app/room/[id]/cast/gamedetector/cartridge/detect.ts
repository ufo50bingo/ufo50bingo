/**
 * Library selection on one frame. It only counts if exactly one cartridge is
 * present (the library shows many) and it is not the purple cobwebbed one,
 * whose label still shows grayscale art; then the art names the game.
 */

import { ORDERED_PROPER_GAMES, ProperGame } from "@/app/goals";
import { sample } from "../imageMath";
import type { Integral } from "../imageMath";
import { PARAMS } from "../params";
import { screenScale } from "../screen";
import type { Aligned, Candidate, FrameResult, ImageDataLike } from "../types";
import { refine } from "./align";
import { matchArt } from "./art";
import { CH, CW, GRID_DX, GRID_DY, inBadgeZone } from "./geometry";
import { getCartridgeModel } from "./model";
import type { CartridgeModel } from "./model";
import { isCartridge, occludedShare } from "./occlusion";
import { coarseCandidates } from "./search";

const tmp3 = new Float32Array(3);

/**
 * True for the purple frame of a cobwebbed cartridge, whose label still shows
 * grayscale art. Decided from the mean color of the label's right block, which
 * is a single color in every variant: purple (68,48,186) has green far below
 * blue and blue above red; teal, white, gold and cherry frames do not, even
 * under strong warm tints. The gain/offset invariant template score cannot
 * make this call reliably once chroma is smeared by stream compression.
 */
function isUnplayedColor(img: ImageDataLike, a: Aligned): boolean {
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let gy = 26.75; gy < 30.5; gy += 0.5) {
    for (let gx = 24.75; gx < 27.5; gx += 0.5) {
      sample(img, a.x + gx * a.s, a.y + gy * a.s, tmp3, 0);
      r += tmp3[0];
      g += tmp3[1];
      b += tmp3[2];
      n++;
    }
  }
  return g < 0.65 * b && b > 1.1 * r;
}

/** A cartridge-like frame at a library grid neighbor position means the library. */
function hasNeighbor(img: ImageDataLike, m: CartridgeModel, a: Aligned): boolean {
  const { x, y, s } = a;
  const offsets = [
    [GRID_DX, 0],
    [-GRID_DX, 0],
    [0, GRID_DY],
    [0, -GRID_DY],
  ];
  for (const [dx, dy] of offsets) {
    const nx = x + dx * s;
    const ny = y + dy * s;
    if (nx < -2 * s || ny < -2 * s || nx + (CW - 2) * s > img.width + 2 * s || ny + (CH - 2) * s > img.height + 2 * s) {
      continue;
    }
    const r = refine(img, m, { x: nx, y: ny, s, score: 0 }, 12, 1);
    if (r.score >= PARAMS.neighborMinScore) return true;
  }
  return false;
}

export function detectCartridge(img: ImageDataLike, integ: Integral, scaleHint?: number): FrameResult {
  const m = getCartridgeModel();
  const nominal = screenScale(img.width, img.height);
  // Only cartridges passing the full frame check count as library evidence;
  // the lenient check under the LIVE badge can be fooled by background tiles.
  const libraryCarts: Aligned[] = [];
  const isCart = (h: Candidate) => {
    const a = refine(img, m, h);
    if (a.score < PARAMS.frameMinScore) return false;
    libraryCarts.push(a);
    return true;
  };
  const { seeds, stopped } = coarseCandidates(integ, (top) => top.filter(isCart).length >= 2, scaleHint);
  if (stopped) return { kind: "library", carts: libraryCarts.length, scale: libraryCarts[0].s / nominal };

  // Verify seeds best-first. Seeds near a cartridge that passed the full frame
  // check are skipped; one that only passed under the LIVE badge may still be
  // aligned better by a nearby seed.
  const carts: Aligned[] = [];
  const near = (c: Aligned, x: number, y: number) => Math.abs(c.x - x) < 8 * c.s && Math.abs(c.y - y) < 8 * c.s;
  const strict = (c: Aligned) => c.score >= PARAMS.frameMinScore;
  let tries = 0;
  for (const h of seeds) {
    if (tries >= PARAMS.maxVerify || carts.filter(strict).length > 1) break;
    if (carts.some((c) => strict(c) && near(c, h.x, h.y))) continue;
    tries++;
    const a = refine(img, m, h);
    if (!isCartridge(img, m, a)) continue;
    const dup = carts.findIndex((c) => near(c, a.x, a.y));
    if (dup < 0) carts.push(a);
    else if (a.score > carts[dup].score) carts[dup] = a;
  }
  const strictCarts = carts.filter(strict);
  // A cartridge accepted only under the badge is used when nothing else passed.
  const pool = strictCarts.length > 0 ? strictCarts : carts;
  if (pool.length === 0) return { kind: "none" };
  pool.sort((a, b) => b.score - a.score);
  const cart = pool[0];
  const scale = cart.s / nominal;
  if (strictCarts.length > 1) return { kind: "library", carts: strictCarts.length, scale };
  if (pool.length > 1) return { kind: "none" };
  if (hasNeighbor(img, m, cart)) return { kind: "library", carts: 2, scale };

  const cobwebbed = isUnplayedColor(img, cart);
  // Only the LIVE badge has been seen to cover enough art to fake another
  // game. Elsewhere the estimate is skipped: at low resolution bright art
  // bleeds into the thin frame and would look like an occluder.
  const occluded = inBadgeZone(img, cart) ? occludedShare(img, m, cart) : 0;
  const art = matchArt(img, m, cart);
  const margin = art.err2 / Math.max(art.err, 1e-3);
  const tMargin = art.tErr2 / Math.max(art.tErr, 1e-3);
  let game: ProperGame | null = null;
  // Whatever covers a large part of the art can mimic another game (the red
  // LIVE badge over black looks like Seaside Drive's car), so demand much
  // clearer evidence then.
  const boost = occluded > PARAMS.occludedShare ? PARAMS.occludedMarginBoost : 1;
  if (!cobwebbed) {
    if (art.err <= PARAMS.artMaxError && margin >= PARAMS.artMinMargin * boost) {
      game = ORDERED_PROPER_GAMES[art.game];
    } else if (art.tErr <= PARAMS.trimMaxError && tMargin >= PARAMS.trimMinMargin * boost) {
      // Part of the art is covered (LIVE badge, smoke): judge by the pixels that fit.
      game = ORDERED_PROPER_GAMES[art.tGame];
    }
  }
  return {
    kind: "cart",
    game,
    bestGame: ORDERED_PROPER_GAMES[art.game],
    cobwebbed,
    box: { x: cart.x, y: cart.y, width: (CW - 2) * cart.s, height: (CH - 2) * cart.s },
    artError: art.err,
    artMargin: margin,
    trimmedGame: ORDERED_PROPER_GAMES[art.tGame],
    trimmedError: art.tErr,
    trimmedMargin: tMargin,
    occluded,
    frameScore: cart.score,
    scale,
  };
}
