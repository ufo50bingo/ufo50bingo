import useWindowSize from "./useWindowSize";

export default function useCanvasScale(
  canvasWidth: number,
  canvasHeight: number,
): number {
  const windowSize = useWindowSize();

  return windowSize.width > 0 &&
    windowSize.height > 0 &&
    canvasWidth > 0 &&
    canvasHeight > 0
    ? Math.min(windowSize.width / canvasWidth, windowSize.height / canvasHeight)
    : 1;
}
