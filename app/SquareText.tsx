import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type Props = {
  text: ReactNode;
  maxFontSize: number;
  minFontSize: number;
  // total space in px to leave free inside the parent on each axis
  horizontalPadding?: number;
  verticalPadding?: number;
};

export default function SquareText({
  text,
  maxFontSize,
  minFontSize,
  horizontalPadding = 0,
  verticalPadding = 0,
}: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);
  const [dummy, setDummy] = useState(0); // only used to force a re-render
  const timeoutRef = useRef<null | NodeJS.Timeout>(null);

  useLayoutEffect(() => {
    const cur = divRef.current;
    const parent = cur?.parentElement;
    if (cur == null || parent == null) {
      return;
    }

    const maxWidth = parent.clientWidth - horizontalPadding;
    const maxHeight = parent.clientHeight - verticalPadding;

    cur.style.width = `${maxWidth}px`;

    const doesFit = (newFontSize: number) => {
      cur.style.fontSize = `${newFontSize}px`;
      return cur.scrollHeight <= maxHeight && cur.scrollWidth <= maxWidth;
    };

    let lower = minFontSize;
    let upper = maxFontSize;
    if (doesFit(upper)) {
      setFontSize(upper);
      return;
    }
    while (upper - lower > 0.1) {
      const mid = (upper + lower) / 2;
      if (doesFit(mid)) {
        lower = mid;
      } else {
        upper = mid;
      }
    }
    cur.style.fontSize = `${lower}px`;
    setFontSize(lower);
  }, [
    text,
    maxFontSize,
    minFontSize,
    horizontalPadding,
    verticalPadding,
    dummy,
  ]);

  useEffect(() => {
    const parent = divRef.current?.parentElement;
    if (parent == null) {
      return;
    }
    const observer = new window.ResizeObserver(() => {
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setDummy((d) => d + 1); // trigger recalculation
      }, 200); // 200ms debounce
    });
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={divRef}
      style={{
        fontSize: `${fontSize}px`,
      }}
    >
      {text}
    </div>
  );
}
