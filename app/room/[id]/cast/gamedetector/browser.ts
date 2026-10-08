// Browser helpers: capture a region of a video and run the detector on it.

import { GameTransitionDetector, RewardIconDetector } from "./detector";
import type { DetectorOptions, GameDetection, RewardIconDetection } from "./detector";
import type { RewardIconResult } from "./rewardIcon/detect";
import type { FrameResult } from "./types";

export type Region = { x: number; y: number; width: number; height: number };

/**
 * Draw a region of a video/canvas into a reusable canvas and return its pixels.
 * Large regions are downscaled to `maxWidth` (3 px per game pixel is plenty).
 */
export function captureRegion(
  source: CanvasImageSource,
  region: Region,
  canvas: HTMLCanvasElement | OffscreenCanvas,
  maxWidth = 1152,
): ImageData {
  const k = Math.min(1, maxWidth / region.width);
  const w = Math.max(1, Math.round(region.width * k));
  const h = Math.max(1, Math.round(region.height * k));
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true }) as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;
  if (ctx == null) throw new Error("2d context unavailable");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, region.x, region.y, region.width, region.height, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

export type DetectionLoopOptions = DetectorOptions & {
  /** Time between analyzed frames. Default 250 ms. */
  intervalMs?: number;
  /** Captures wider than this are downscaled first. Default 1152 px. */
  maxWidth?: number;
  /** Called after every analyzed frame, e.g. for a debug readout. */
  onFrame?: (result: FrameResult, elapsedMs: number, icon: RewardIconResult | null) => void;
  // Called once each time a reward icon appears
  onRewardIcon?: (detection: RewardIconDetection) => void;
};

/**
 * Analyze `getRegion()` of the video every `intervalMs` and call `onGame` for
 * each newly selected game. `getRegion` returns the crop in video pixels (or
 * null to skip a tick). Returns a function that stops the loop.
 */
export function startGameDetection(
  video: HTMLVideoElement,
  getRegion: () => Region | null,
  onGame: (detection: GameDetection) => void,
  opts: DetectionLoopOptions = {},
): () => void {
  const detector = new GameTransitionDetector(opts);
  const iconDetector = new RewardIconDetector(opts);
  const canvas = document.createElement("canvas");
  let timer = 0;
  let stopped = false;
  const tick = () => {
    if (stopped) return;
    const region = getRegion();
    if (region != null && region.width >= 1 && region.height >= 1 && video.readyState >= 2) {
      const t0 = performance.now();
      const img = captureRegion(video, region, canvas, opts.maxWidth);
      const detection = detector.update(img, t0);
      const icon = iconDetector.update(img, t0);
      opts.onFrame?.(detector.lastResult, performance.now() - t0, iconDetector.lastResult);
      if (detection != null) onGame(detection);
      if (icon != null) opts.onRewardIcon?.(icon);
    }
    // Chained timeouts never pile up if a frame takes longer than the interval.
    timer = window.setTimeout(tick, opts.intervalMs ?? 250);
  };
  tick();
  return () => {
    stopped = true;
    window.clearTimeout(timer);
  };
}
