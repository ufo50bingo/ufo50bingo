import { ProperGame } from "@/app/goals";
import { classifyFrame } from "./classifyFrame";
import type { FrameResult, ImageDataLike } from "./types";

export type GameDetection = {
  game: ProperGame;
  timestamp: number;
  /** Picked in the library, or entered as a terminal code. */
  source: "library" | "terminal";
  /** The terminal code, for source "terminal". */
  code?: string;
};

export type DetectorOptions = {
  /** Consecutive confident frames (same game or code) required before reporting. Default 2. */
  minFrames?: number;
  /** Those frames must fall within this window. Default 2500 ms. */
  windowMs?: number;
  /**
   * The same game is reported again after the library or an empty/half-typed
   * terminal input reappears, or after this long without a cartridge or code
   * on screen. Default 5000 ms.
   */
  resetMs?: number;
  /** Search all scales on every Nth frame even when a scale hint is known. Default 6. */
  fullSearchEvery?: number;
};

/**
 * Feed it frames (4 per second is plenty); `update` returns a detection when a
 * newly selected game (library cartridge or valid terminal code) has been seen
 * consistently, otherwise null.
 *
 * It also remembers the scale from any confidently matched cartridge or
 * terminal screen so later frames only search around it.
 */
export class GameTransitionDetector {
  private readonly minFrames: number;
  private readonly windowMs: number;
  private readonly resetMs: number;
  private readonly fullSearchEvery: number;
  private recent: { key: string; t: number }[] = [];
  private lastSeenTime = -Infinity;
  private emitted: string | null = null;
  private scaleHint: number | null = null;
  private frameSize = "";
  private frames = 0;
  lastResult: FrameResult = { kind: "none" };

  constructor(opts: DetectorOptions = {}) {
    this.minFrames = opts.minFrames ?? 2;
    this.windowMs = opts.windowMs ?? 2500;
    this.resetMs = opts.resetMs ?? 5000;
    this.fullSearchEvery = opts.fullSearchEvery ?? 6;
  }

  update(img: ImageDataLike, timestamp: number = performance.now()): GameDetection | null {
    const size = `${img.width}x${img.height}`;
    if (size !== this.frameSize) {
      this.frameSize = size;
      this.scaleHint = null;
    }
    const full = this.scaleHint == null || this.frames++ % this.fullSearchEvery === 0;
    const r = classifyFrame(img, full ? {} : { scaleHint: this.scaleHint! });
    this.lastResult = r;
    if (r.kind === "library" || r.kind === "terminal" || (r.kind === "cart" && r.frameScore >= 0.75)) {
      this.scaleHint = r.scale;
    }

    // What the frame shows that could start a game, keyed so that repeats of
    // the same selection are recognized.
    let seen: { key: string; detection: GameDetection | null } | null = null;
    if (r.kind === "cart") {
      seen = { key: `cart:${r.game}`, detection: r.game && { game: r.game, timestamp, source: "library" } };
    } else if (r.kind === "terminal" && r.code != null) {
      const detection: GameDetection | null = r.game && { game: r.game, timestamp, source: "terminal", code: r.code };
      seen = { key: `code:${r.code}`, detection };
    }
    if (seen == null) {
      // Back in the library, typing in the terminal, or long enough without a
      // cartridge or code: the next selection is new even for the same game.
      const typing = r.kind === "terminal" && /[_*]/.test(r.text);
      if (r.kind === "library" || typing || timestamp - this.lastSeenTime > this.resetMs) {
        this.emitted = null;
        this.recent = [];
      }
      return null;
    }
    this.lastSeenTime = timestamp;
    // Cobwebbed or uncertain cartridge, or a code that is not in the list.
    if (seen.detection == null) return null;
    const key = seen.key;
    this.recent.push({ key, t: timestamp });
    this.recent = this.recent.filter((d) => timestamp - d.t <= this.windowMs).slice(-this.minFrames);
    if (this.recent.length < this.minFrames || this.recent.some((d) => d.key !== key)) return null;
    // A later, consistent reading of a different game replaces an earlier one.
    if (this.emitted === key) return null;
    this.emitted = key;
    return seen.detection;
  }

  reset() {
    this.recent = [];
    this.emitted = null;
    this.lastSeenTime = -Infinity;
    this.scaleHint = null;
    this.frames = 0;
  }
}
