import { useEffect, useLayoutEffect, useRef, useState } from "react";

type Props = {
  text: string;
  hasOverlays: boolean;
};

type FontSearch = {
  fontSize: number;
  lower: number;
  upper: number;
};

const DEFAULT_SEARCH = { fontSize: 100, lower: 65, upper: 100 };

export default function SquareText({ text, hasOverlays }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const [fontSearch, setFontSearch] = useState(DEFAULT_SEARCH);
  const timeoutRef = useRef<null | NodeJS.Timeout>(null);

  if (text === "VALBRACE: Level up at two thrones & defeat the Phantom Knight on Floor 2") {
    console.log(fontSearch);
  }

  useLayoutEffect(() => {
    const cur = divRef.current;
    if (cur == null || fontSearch.fontSize === fontSearch.lower) {
      return;
    }
    const parent = cur.parentElement?.getBoundingClientRect();
    // 10px padding
    const heightThreshold = (parent?.height ?? 95) - (hasOverlays ? 30 : 10);
    const widthThreshold = (parent?.width ?? 105) - 10;
    const { height, width } = cur.getBoundingClientRect();
    const fits = height <= heightThreshold && width <= widthThreshold;
    if (fits && fontSearch.fontSize >= fontSearch.upper - 1) {
      return;
    }
    const lower = fits ? fontSearch.fontSize : fontSearch.lower;
    const upper = fits ? fontSearch.upper : fontSearch.fontSize;
    setFontSearch({
      fontSize: upper - lower >= 1 ? (lower + upper) / 2 : lower,
      upper,
      lower,
    });
  }, [fontSearch, hasOverlays]);

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
        setFontSearch({ ...DEFAULT_SEARCH }); // Reset font size to trigger recalculation
      }, 200); // 200ms debounce
    });
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={divRef} style={{ fontSize: `${fontSearch.fontSize}%` }}>
      {text}
    </div>
  );
}
