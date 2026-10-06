import { detectCartridge } from "./cartridge/detect";
import { integralImage } from "./imageMath";
import { screenScale } from "./screen";
import { detectTerminal } from "./terminal/detect";
import type { FrameResult, ImageDataLike } from "./types";

export type ClassifyOptions = {
  /**
   * Expected cartridge scale relative to min(width / 384, height / 216), e.g.
   * the `scale` of an earlier result. Searches 3 scales around it instead of
   * the full range, which is about 2.5x faster.
   */
  scaleHint?: number;
};

/** What a single frame shows: the terminal, the library, a lone cartridge, or none of these. */
export function classifyFrame(img: ImageDataLike, opts: ClassifyOptions = {}): FrameResult {
  // Below one input pixel per game pixel there is nothing to recognize.
  if (screenScale(img.width, img.height) < 1) return { kind: "none" };
  const integ = integralImage(img);
  return detectTerminal(img, integ, opts.scaleHint) ?? detectCartridge(img, integ, opts.scaleHint);
}
