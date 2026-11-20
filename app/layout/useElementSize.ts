import { useEffect, useState } from "react";

export default function useElementSize(element: HTMLElement | null): {
  width: number;
  height: number;
} {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (element == null) {
      return;
    }

    const updateSize = () => {
      setSize({ width: element.clientWidth, height: element.clientHeight });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [element]);

  return size;
}
