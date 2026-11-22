import useElementSize from "./useElementSize";

export default function useCanvasScale(
  viewportEl: HTMLElement | null,
  canvasWidth: number,
  canvasHeight: number,
): number {
  const viewportSize = useElementSize(viewportEl);

  return viewportSize.width > 0 &&
    viewportSize.height > 0 &&
    canvasWidth > 0 &&
    canvasHeight > 0
    ? Math.min(
        viewportSize.width / canvasWidth,
        viewportSize.height / canvasHeight,
      )
    : 1;
}
