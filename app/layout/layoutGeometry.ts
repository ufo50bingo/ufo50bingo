import type { Rect } from "./layoutTypes";

export type ResizeDirection = [number, number];

interface AxisScale {
  anchor: number;
  scale: number;
  minScale: number;
  maxScale: number;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

export function getPosition(
  x: number,
  y: number,
  width: number,
  height: number,
  canvasWidth: number,
  canvasHeight: number,
): Rect {
  return {
    x: clamp(x, 0, Math.max(0, canvasWidth - width)),
    y: clamp(y, 0, Math.max(0, canvasHeight - height)),
    width,
    height,
  };
}

export function getSize(
  x: number,
  y: number,
  width: number,
  height: number,
  canvasWidth: number,
  canvasHeight: number,
): Rect {
  const left = clamp(x, 0, canvasWidth - 1);
  const top = clamp(y, 0, canvasHeight - 1);

  const right = clamp(x + width, left + 1, canvasWidth);
  const bottom = clamp(y + height, top + 1, canvasHeight);

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
}

export function getBounds(rects: ReadonlyArray<Rect>): Rect {
  const minX = Math.min(...rects.map((r) => r.x));
  const minY = Math.min(...rects.map((r) => r.y));
  const maxX = Math.max(...rects.map((r) => r.x + r.width));
  const maxY = Math.max(...rects.map((r) => r.y + r.height));

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function clampGroupDelta(
  rects: ReadonlyArray<Rect>,
  canvasWidth: number,
  canvasHeight: number,
): { dx: number; dy: number } {
  if (rects.length === 0) {
    return { dx: 0, dy: 0 };
  }

  const bounds = getBounds(rects);

  return {
    dx: clamp(0, -bounds.x, canvasWidth - (bounds.x + bounds.width)),
    dy: clamp(0, -bounds.y, canvasHeight - (bounds.y + bounds.height)),
  };
}

export function getPointerScale(
  bounds: Rect,
  direction: ResizeDirection,
  dx: number,
  dy: number,
): { x: number; y: number } {
  const [dirX, dirY] = direction;

  return {
    x:
      dirX === 0 || bounds.width <= 0
        ? 1
        : (bounds.width + dirX * dx) / bounds.width,
    y:
      dirY === 0 || bounds.height <= 0
        ? 1
        : (bounds.height + dirY * dy) / bounds.height,
  };
}

function getAxisScale(
  startPos: ReadonlyArray<number>,
  startSize: ReadonlyArray<number>,
  scale: number,
  dir: number,
  canvasSize: number,
): AxisScale | null {
  const groupMin = Math.min(...startPos);
  const groupMax = Math.max(...startPos.map((p, i) => p + startSize[i]));
  const groupSize = groupMax - groupMin;
  const smallest = Math.min(...startSize);

  if (dir === 0 || groupSize <= 0 || smallest <= 0) {
    return null;
  }

  const anchorIsMin = dir > 0;

  return {
    anchor: anchorIsMin ? groupMin : groupMax,
    scale,
    maxScale: anchorIsMin
      ? (canvasSize - groupMin) / groupSize
      : groupMax / groupSize,
    minScale: 1 / smallest,
  };
}

function clampScale(axis: AxisScale): number {
  return clamp(
    axis.scale,
    axis.minScale,
    Math.max(axis.minScale, axis.maxScale),
  );
}

function scaleAxis(
  startPos: ReadonlyArray<number>,
  startSize: ReadonlyArray<number>,
  axis: AxisScale | null,
  scale: number,
) {
  if (axis == null) {
    return { positions: startPos, sizes: startSize };
  }

  return {
    positions: startPos.map((p) => axis.anchor + (p - axis.anchor) * scale),
    sizes: startSize.map((size) => size * scale),
  };
}

export function constrainGroupResize(
  start: ReadonlyArray<Rect>,
  scale: { x: number; y: number },
  canvasWidth: number,
  canvasHeight: number,
  direction: ResizeDirection,
  keepRatio = false,
): ReadonlyArray<Rect> {
  if (start.length === 0) {
    return start;
  }

  const startX = start.map((r) => r.x);
  const startW = start.map((r) => r.width);
  const startY = start.map((r) => r.y);
  const startH = start.map((r) => r.height);

  const xAxis = getAxisScale(
    startX,
    startW,
    scale.x,
    direction[0],
    canvasWidth,
  );
  const yAxis = getAxisScale(
    startY,
    startH,
    scale.y,
    direction[1],
    canvasHeight,
  );

  let sx = 1;
  let sy = 1;

  if (keepRatio && xAxis != null && yAxis != null) {
    const lo = Math.max(xAxis.minScale, yAxis.minScale);
    const hi = Math.max(lo, Math.min(xAxis.maxScale, yAxis.maxScale));

    const requested =
      Math.abs(xAxis.scale - 1) >= Math.abs(yAxis.scale - 1)
        ? xAxis.scale
        : yAxis.scale;

    sx = clamp(requested, lo, hi);
    sy = sx;
  } else {
    if (xAxis != null) {
      sx = clampScale(xAxis);
    }

    if (yAxis != null) {
      sy = clampScale(yAxis);
    }
  }

  const horizontal = scaleAxis(startX, startW, xAxis, sx);
  const vertical = scaleAxis(startY, startH, yAxis, sy);

  return start.map((_, i) => ({
    x: horizontal.positions[i],
    y: vertical.positions[i],
    width: horizontal.sizes[i],
    height: vertical.sizes[i],
  }));
}
