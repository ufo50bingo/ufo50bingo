import { useCallback, useMemo, useRef } from "react";
import type {
  OnDrag,
  OnDragEnd,
  OnDragGroup,
  OnDragGroupEnd,
  OnResize,
  OnResizeEnd,
  OnResizeGroup,
  OnResizeGroupEnd,
  OnResizeGroupStart,
  OnResizeStart,
} from "react-moveable";
import {
  applyGeometry,
  getHtmlTarget,
  getPointer,
  readGeometry,
  toResizeDirection,
} from "./layoutDom";
import type { Point } from "./layoutDom";
import {
  clampGroupDelta,
  constrainGroupResize,
  getBounds,
  getPointerScale,
  getPosition,
  getSize,
} from "./layoutGeometry";
import type { ResizeDirection } from "./layoutGeometry";
import type {
  EditorEvent,
  GeometryEvent,
  Rect,
  WidgetGeometry,
} from "./layoutTypes";

type Props = {
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
  onCommit: (event: EditorEvent) => void;
};

interface ResizeItem {
  target: HTMLElement;
  widgetId: string;
  rect: Rect;
}

interface ResizeSession {
  items: ReadonlyArray<ResizeItem>;
  direction: ResizeDirection;
  lockRatio: boolean;
  // position when resize began
  pointer: Point;
}

export default function useWidgetInteractions({
  canvasWidth,
  canvasHeight,
  scale,
  onCommit,
}: Props) {
  const resizeSession = useRef<ResizeSession | null>(null);

  const commitTargets = useCallback(
    (targets: ReadonlyArray<HTMLElement>, action: GeometryEvent["action"]) => {
      const geometries: Array<WidgetGeometry> = [];

      targets.forEach((element) => {
        const geometry = readGeometry(element);

        if (geometry == null) {
          return;
        }

        const constrained = getSize(
          geometry.x,
          geometry.y,
          geometry.width,
          geometry.height,
          canvasWidth,
          canvasHeight,
        );

        const finalGeometry = { ...constrained, widgetId: geometry.widgetId };

        applyGeometry(element, finalGeometry);
        geometries.push(finalGeometry);
      });

      if (geometries.length === 0) {
        return;
      }

      onCommit({ type: "geometry", action, geometries });
    },
    [canvasWidth, canvasHeight, onCommit],
  );

  const onDrag = useCallback(
    (e: OnDrag) => {
      const target = getHtmlTarget(e.target);
      const widgetId = target.dataset.id;

      if (widgetId == null) {
        return;
      }

      const geometry = getPosition(
        e.left,
        e.top,
        target.offsetWidth,
        target.offsetHeight,
        canvasWidth,
        canvasHeight,
      );

      applyGeometry(target, { ...geometry, widgetId });
    },
    [canvasWidth, canvasHeight],
  );

  const onDragGroup = useCallback(
    (e: OnDragGroup) => {
      const items = e.events.map((event) => ({
        event,
        target: getHtmlTarget(event.target),
      }));

      if (items.length === 0) {
        return;
      }

      const { dx, dy } = clampGroupDelta(
        items.map(({ event, target }) => ({
          x: event.left,
          y: event.top,
          width: target.offsetWidth,
          height: target.offsetHeight,
        })),
        canvasWidth,
        canvasHeight,
      );

      items.forEach(({ event, target }) => {
        const widgetId = target.dataset.id;

        if (widgetId == null) {
          return;
        }

        const geometry = getPosition(
          event.left + dx,
          event.top + dy,
          target.offsetWidth,
          target.offsetHeight,
          canvasWidth,
          canvasHeight,
        );

        applyGeometry(target, { ...geometry, widgetId });
      });
    },
    [canvasWidth, canvasHeight],
  );

  const startResize = useCallback(
    (
      targets: ReadonlyArray<HTMLElement>,
      event: { direction: ReadonlyArray<number>; inputEvent: Event },
    ) => {
      const items: Array<ResizeItem> = [];

      targets.forEach((target) => {
        const geometry = readGeometry(target);

        if (geometry != null) {
          items.push({
            target,
            widgetId: geometry.widgetId,
            rect: {
              x: geometry.x,
              y: geometry.y,
              width: geometry.width,
              height: geometry.height,
            },
          });
        }
      });

      const direction = toResizeDirection(event.direction);
      const pointer = getPointer(event.inputEvent);

      if (items.length === 0 || pointer == null) {
        resizeSession.current = null;
        return;
      }

      resizeSession.current = {
        items,
        direction,
        // One locked widget locks the whole selection
        lockRatio: items.some(
          ({ target }) => target.dataset.lockAspectRatio === "true",
        ),
        pointer,
      };
    },
    [],
  );

  const applyResize = useCallback(
    (inputEvent: Event) => {
      const session = resizeSession.current;
      const pointer = getPointer(inputEvent);

      if (session == null || pointer == null) {
        return;
      }

      const dx = (pointer.x - session.pointer.x) / scale;
      const dy = (pointer.y - session.pointer.y) / scale;

      const startRects = session.items.map((item) => item.rect);

      const requestedScale = getPointerScale(
        getBounds(startRects),
        session.direction,
        dx,
        dy,
      );

      const rects = constrainGroupResize(
        startRects,
        requestedScale,
        canvasWidth,
        canvasHeight,
        session.direction,
        session.lockRatio,
      );

      session.items.forEach(({ target, widgetId }, i) => {
        applyGeometry(target, { ...rects[i], widgetId });
      });
    },
    [canvasWidth, canvasHeight, scale],
  );

  const onResizeStart = useCallback(
    (e: OnResizeStart) => {
      startResize([getHtmlTarget(e.target)], {
        direction: e.direction,
        inputEvent: e.inputEvent,
      });
    },
    [startResize],
  );

  const onResizeGroupStart = useCallback(
    (e: OnResizeGroupStart) => {
      startResize(e.targets.map(getHtmlTarget), {
        direction: e.direction,
        inputEvent: e.inputEvent,
      });
    },
    [startResize],
  );

  const onResize = useCallback(
    (e: OnResize) => applyResize(e.inputEvent),
    [applyResize],
  );

  const onResizeGroup = useCallback(
    (e: OnResizeGroup) => applyResize(e.inputEvent),
    [applyResize],
  );

  const onDragEnd = useCallback(
    (e: OnDragEnd) => commitTargets([getHtmlTarget(e.target)], "move"),
    [commitTargets],
  );

  const onDragGroupEnd = useCallback(
    (e: OnDragGroupEnd) =>
      commitTargets(e.targets.map(getHtmlTarget), "group-move"),
    [commitTargets],
  );

  const onResizeEnd = useCallback(
    (e: OnResizeEnd) => {
      resizeSession.current = null;
      commitTargets([getHtmlTarget(e.target)], "resize");
    },
    [commitTargets],
  );

  const onResizeGroupEnd = useCallback(
    (e: OnResizeGroupEnd) => {
      resizeSession.current = null;
      commitTargets(e.targets.map(getHtmlTarget), "group-resize");
    },
    [commitTargets],
  );

  return useMemo(
    () => ({
      onDrag,
      onDragGroup,
      onResizeStart,
      onResize,
      onResizeGroupStart,
      onResizeGroup,
      onDragEnd,
      onDragGroupEnd,
      onResizeEnd,
      onResizeGroupEnd,
    }),
    [
      onDrag,
      onDragGroup,
      onResizeStart,
      onResize,
      onResizeGroupStart,
      onResizeGroup,
      onDragEnd,
      onDragGroupEnd,
      onResizeEnd,
      onResizeGroupEnd,
    ],
  );
}

export type WidgetInteractionHandlers = ReturnType<
  typeof useWidgetInteractions
>;
