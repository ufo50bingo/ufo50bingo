import { TUNED } from "./generated/thresholds";

/**
 * Detection parameters. The values here are hand-set; the art-match thresholds
 * that tools/tune.py calibrates (generated/thresholds.ts) override them.
 */
export const PARAMS = {
  /** Scale search range relative to min(width / 384, height / 216). */
  scaleMin: 0.86,
  scaleMax: 1.14,
  scaleStep: 0.04,
  /** Coarse position step in game px. */
  coarseStep: 1,
  /** Minimum brightness gap between the cart's bright and dark regions (0-255). */
  coarseMinContrast: 16,
  /** Brightest dark region may be at most this fraction of the darkest bright region. */
  coarseMaxDarkRatio: 0.7,
  maxVerify: 8,
  /** This many separate coarse hits triggers an early library check. */
  libraryHits: 8,
  /** Seeds whose best 5x5-scan frame score is below this are dropped before refinement. */
  seedMinScore: 0.3,
  frameMinScore: 0.5,
  /** Share of worst-fitting frame pixels ignored when verifying a cartridge in the LIVE badge corner. */
  badgeFrameTrim: 0.3,
  /** Relative scale step around a scale hint. */
  hintStep: 0.03,
  /** Grid neighbors only need to look roughly like a cartridge (cobwebs cover their frames). */
  neighborMinScore: 0.32,
  /**
   * Art match acceptance: error at most artMaxError and margin at least
   * artMinMargin (trim*: same for the occlusion-tolerant fallback). These
   * defaults are overridden by the values in generated/thresholds.ts.
   */
  artMaxError: 0.45,
  artMinMargin: 1.8,
  trimMaxError: 0.3,
  trimMinMargin: 2.5,
  /** Gaussian blur (game px) applied to references to mimic stream softness. */
  refBlur: 0.5,
  /** Frame pixel residual (relative to the frame's color variance) that counts as covered. */
  occlusionResidual: 1.5,
  /** Above this covered share of the art, required margins are multiplied by occludedMarginBoost. */
  occludedShare: 0.2,
  occludedMarginBoost: 2.5,
  /** Coarse keyboard test: (glyph columns - gaps) / glyph columns brightness. */
  keyboardMinContrast: 0.5,
  /** Fine keyboard template correlation needed to treat the frame as the terminal. */
  keyboardMinScore: 0.7,
  /** Share of the template difference between the best and runner-up glyph that must favor the best. */
  glyphMinEvidence: 0.4,
  /** Mean squared error (0-1 scale) allowed between a cell and its best glyph. */
  glyphMaxError: 0.06,
  /** Panel correlation that counts as the game's "CODE ACCEPTED!" message. */
  acceptedMinScore: 0.7,
  ...(TUNED as Record<string, number>),
};
