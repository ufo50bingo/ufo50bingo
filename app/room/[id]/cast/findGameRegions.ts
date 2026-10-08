import type { CropRect } from "./CaptureRegionSelectionModal";
import type { ImageDataLike } from "./gamedetector/types";

type Box = { x: number; y: number; w: number; h: number };
type Counter = (x0: number, y0: number, x1: number, y1: number) => number;

// Guesses where the game screens are in a capture of a Discord window. A
// "<name>'s Stream" popout shows a single stream. In a call, each stream is a
// 16:9 tile with a red LIVE badge in its top right corner.
export default function findGameRegions(
  img: ImageDataLike,
  windowLabel: string,
): ReadonlyArray<CropRect> {
  const count = getCounter(img);
  const toCropRect = (box: Box): CropRect => ({
    x: box.x / img.width,
    y: box.y / img.height,
    width: box.w / img.width,
    height: box.h / img.height,
  });
  if (!/['’]s Stream/.test(windowLabel)) {
    const badges = findLiveBadges(img);
    // Browsers don't always share the window title, so look for badges anyway
    if (badges.length > 0 || windowLabel.includes("Discord")) {
      const games = badges.flatMap((badge) => {
        const tile = findTile(count, badge, img.height);
        if (tile == null) {
          return [];
        }
        const video = findVideo(count, tile);
        return [video == null ? tile : fit16x9(video, "bottom")];
      });
      games.sort((a, b) =>
        Math.abs(a.y - b.y) < a.h / 2 ? a.x - b.x : a.y - b.y,
      );
      return games.map(toCropRect);
    }
  }
  const full = { x: 0, y: 0, w: img.width, h: img.height };
  const video = findVideo(count, full);
  return [
    toCropRect(
      video == null ? fit16x9(full, "center") : fit16x9(video, "bottom"),
    ),
  ];
}

// Counts the pixels in a box that are brighter than the black background of a
// call
function getCounter({ data, width, height }: ImageDataLike): Counter {
  const stride = width + 1;
  const sums = new Int32Array(stride * (height + 1));
  for (let y = 0; y < height; y++) {
    let rowSum = 0;
    for (let x = 0; x < width; x++) {
      const i = 4 * (y * width + x);
      if (Math.max(data[i], data[i + 1], data[i + 2]) > 24) {
        rowSum++;
      }
      sums[(y + 1) * stride + x + 1] = sums[y * stride + x + 1] + rowSum;
    }
  }
  return (x0, y0, x1, y1) => {
    const left = Math.max(0, Math.round(x0));
    const top = Math.max(0, Math.round(y0));
    const right = Math.min(width, Math.round(x1));
    const bottom = Math.min(height, Math.round(y1));
    if (right <= left || bottom <= top) {
      return 0;
    }
    return (
      sums[bottom * stride + right] -
      sums[top * stride + right] -
      sums[bottom * stride + left] +
      sums[top * stride + left]
    );
  };
}

// Red pills with white text, about 2.5 times as wide as they are tall
function findLiveBadges({ data, width, height }: ImageDataLike): Box[] {
  const isRed = (p: number) =>
    data[4 * p] > 170 &&
    data[4 * p + 1] < 110 &&
    data[4 * p + 2] < 110 &&
    data[4 * p] - data[4 * p + 1] > 90;
  const isWhite = (p: number) =>
    data[4 * p] > 200 && data[4 * p + 1] > 200 && data[4 * p + 2] > 200;
  const seen = new Uint8Array(width * height);
  const badges: Box[] = [];
  for (let start = 0; start < width * height; start++) {
    if (seen[start] || !isRed(start)) {
      continue;
    }
    let [x0, y0, x1, y1] = [width, height, 0, 0];
    let red = 0;
    const stack = [start];
    const visit = (p: number) => {
      if (!seen[p] && isRed(p)) {
        seen[p] = 1;
        stack.push(p);
      }
    };
    seen[start] = 1;
    while (stack.length > 0) {
      const p = stack.pop()!;
      const x = p % width;
      const y = (p - x) / width;
      red++;
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x);
      y1 = Math.max(y1, y);
      if (x > 0) {
        visit(p - 1);
      }
      if (x < width - 1) {
        visit(p + 1);
      }
      if (y > 0) {
        visit(p - width);
      }
      if (y < height - 1) {
        visit(p + width);
      }
    }
    const w = x1 - x0 + 1;
    const h = y1 - y0 + 1;
    if (h < 8 || h > 60 || w < 1.9 * h || w > 3.2 * h) {
      continue;
    }
    let white = 0;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (isWhite(y * width + x)) {
          white++;
        }
      }
    }
    const area = w * h;
    if (
      red > 0.45 * area &&
      red + white > 0.65 * area &&
      white > 0.06 * area &&
      white < 0.35 * area
    ) {
      badges.push({ x: x0, y: y0, w, h });
    }
  }
  return badges;
}

// The badge is inset from the top right corner of its tile by about half its
// height. Tiles have black gaps between them, so the tile is the smallest one
// with content along its bottom edge and black below and to the left of it.
function findTile(count: Counter, badge: Box, height: number): Box | null {
  const fraction = (x0: number, y0: number, x1: number, y1: number) =>
    count(x0, y0, x1, y1) /
    ((Math.round(x1) - Math.round(x0)) * (Math.round(y1) - Math.round(y0)));
  const top = badge.y - 0.5 * badge.h;
  const right = badge.x + badge.w + 0.55 * badge.h;
  const gap = Math.max(2, Math.round(0.35 * badge.h));
  for (let h = 5 * badge.h; top + h <= height; h++) {
    const w = (16 / 9) * h;
    const left = right - w;
    if (left < 0) {
      return null;
    }
    const bottom = top + h;
    if (
      fraction(left, bottom, right, bottom + gap) < 0.005 &&
      fraction(left - gap, top, left, bottom) < 0.005 &&
      fraction(left, bottom - gap, right, bottom) > 0.05
    ) {
      return { x: left, y: top, w, h };
    }
  }
  return null;
}

// The video in a box without its black bars. Columns are checked in the bottom
// half, away from the LIVE badge and any title bar. The video is centered, so
// the narrower side bar is the real one, since games can have black edges too.
// The top is kept because a title bar can sit above the game.
function findVideo(count: Counter, box: Box): Box | null {
  const isBlackColumn = (x: number) =>
    count(x, box.y + box.h / 2, x + 1, box.y + box.h) < 0.05 * box.h;
  const isBlackRow = (y: number) =>
    count(box.x, y, box.x + box.w, y + 1) < 0.1 * box.w;
  let left = 0;
  let right = 0;
  let bottom = 0;
  while (left < box.w / 2 && isBlackColumn(box.x + left)) {
    left++;
  }
  while (right < box.w / 2 && isBlackColumn(box.x + box.w - 1 - right)) {
    right++;
  }
  while (bottom < box.h / 2 && isBlackRow(box.y + box.h - 1 - bottom)) {
    bottom++;
  }
  const side = Math.min(left, right);
  const video = {
    x: box.x + side,
    y: box.y,
    w: box.w - 2 * side,
    h: box.h - bottom,
  };
  return video.w < box.w / 2 || video.h < box.h / 2 ? null : video;
}

// The largest 16:9 box inside a box
function fit16x9(box: Box, align: "bottom" | "center"): Box {
  const w = Math.min(box.w, (16 / 9) * box.h);
  const h = (9 / 16) * w;
  return {
    x: box.x + (box.w - w) / 2,
    y: align === "bottom" ? box.y + box.h - h : box.y + (box.h - h) / 2,
    w,
    h,
  };
}
