import { ProperGame } from "@/app/goals";

/** RGBA pixels, e.g. a canvas ImageData. */
export type ImageDataLike = {
  data: Uint8ClampedArray | Uint8Array;
  width: number;
  height: number;
};

export type CartBox = { x: number; y: number; width: number; height: number };

export type FrameResult =
  | { kind: "none" }
  | {
    kind: "terminal";
    /** The full code (e.g. "BEAN-DRIP") if every input cell was read confidently, else null. */
    code: string | null;
    /** Game for a code listed in codes.csv; null while typing, if unreadable, or for invalid codes. */
    game: ProperGame | null;
    /** Per-cell reading: '_' empty, '*' cursor, '~' not confidently read. */
    text: string;
    /** Correlation of the on-screen keyboard with its template (0-1). */
    keyboardScore: number;
    /** Correlation of the right panel with "CODE ACCEPTED!" (0-1). */
    accepted: number;
    scale: number;
  }
  | {
    kind: "library";
    carts: number;
    /** Cartridge scale relative to min(width / 384, height / 216); usable as a scale hint. */
    scale: number;
  }
  | {
    kind: "cart";
    /** The identified game, or null if the cartridge is cobwebbed or the art match is not confident. */
    game: ProperGame | null;
    /** Closest art regardless of confidence (for debugging and tuning). */
    bestGame: ProperGame;
    /** Purple cobwebbed cartridge: the art is still grayscale, so no game is reported yet. */
    cobwebbed: boolean;
    /** Cartridge (without shadow) in input pixel coordinates. */
    box: CartBox;
    /** 1 - R^2 of the best art match (0 = perfect). */
    artError: number;
    /** Error of the runner-up art divided by the best error (higher = more certain). */
    artMargin: number;
    /** Same three, ignoring the worst-fitting 25% of art pixels (used when part of the art is covered). */
    trimmedGame: ProperGame;
    trimmedError: number;
    trimmedMargin: number;
    /** Estimated share of the art under the LIVE badge (top-right corner only); stricter margins apply above 0.2. */
    occluded: number;
    /** R^2 of the cartridge frame template match. */
    frameScore: number;
    /** Cartridge scale relative to min(width / 384, height / 216); usable as a scale hint. */
    scale: number;
  };

/**
 * Internal: where a template (cartridge or keyboard) sits in the input, as the
 * position of its origin in input pixels and its scale in input pixels per
 * game pixel. Coarse searches return these with a search-specific score.
 */
export type Candidate = { x: number; y: number; s: number; score: number };

/** Internal: a candidate after fine alignment; `score` is the template match score. */
export type Aligned = Candidate;
