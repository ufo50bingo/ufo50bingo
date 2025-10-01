import { useLayoutEffect, useRef, useState } from "react";

type Props = {
  maxHeight?: number;
  text: string;
};

export default function SquareText({ text, maxHeight }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(100);

  const heightThreshold = maxHeight ?? 85;

  useLayoutEffect(() => {
    const cur = divRef.current;
    if (cur == null) {
      return;
    }
    const { height } = cur.getBoundingClientRect();
    // 95px allowed height, 10px padding
    if (height > heightThreshold) {
      setFontSize(fontSize - 1);
    }
  }, [fontSize, heightThreshold]);

  return (
    <div ref={divRef} style={{ fontSize: `${fontSize}%` }}>
      {text}
    </div>
  );
}
