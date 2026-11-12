import type { ResizeDirection } from "./layoutGeometry";
import type { WidgetGeometry } from "./layoutTypes";

export interface Point {
  x: number;
  y: number;
}

export function getHtmlTarget(target: HTMLElement | SVGElement): HTMLElement {
  if (!(target instanceof HTMLElement)) {
    throw new Error("Expected an HTML widget target");
  }

  return target;
}

export function applyGeometry(
  target: HTMLElement,
  geometry: WidgetGeometry,
): void {
  target.style.left = `${geometry.x}px`;
  target.style.top = `${geometry.y}px`;
  target.style.width = `${geometry.width}px`;
  target.style.height = `${geometry.height}px`;
}

export function readGeometry(target: HTMLElement): WidgetGeometry | null {
  const widgetId = target.dataset.id;

  if (widgetId == null) {
    return null;
  }

  const geometry = {
    widgetId,
    x: parseFloat(target.style.left),
    y: parseFloat(target.style.top),
    width: parseFloat(target.style.width),
    height: parseFloat(target.style.height),
  };

  if (
    !Number.isFinite(geometry.x) ||
    !Number.isFinite(geometry.y) ||
    !Number.isFinite(geometry.width) ||
    !Number.isFinite(geometry.height)
  ) {
    return null;
  }

  return geometry;
}

export function getPointer(event: Event | undefined): Point | null {
  if (typeof TouchEvent !== "undefined" && event instanceof TouchEvent) {
    const touch = event.touches[0] ?? event.changedTouches[0];

    return touch == null ? null : { x: touch.clientX, y: touch.clientY };
  }

  if (event instanceof MouseEvent) {
    return { x: event.clientX, y: event.clientY };
  }

  return null;
}

export function toResizeDirection(
  direction: ReadonlyArray<number>,
): ResizeDirection {
  return [Math.sign(direction[0] ?? 0), Math.sign(direction[1] ?? 0)];
}
