import { useLayoutEffect, useRef, useState } from "react";

type Props = {
  text: string;
};

export default function SquareText({ text }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(100);

  useLayoutEffect(() => {
    console.log("running layout effect");
    const cur = divRef.current;
    if (cur == null) {
      return;
    }
    const { height } = cur.getBoundingClientRect();
    // 95px allowed height, 10px padding
    if (height > 85) {
      setFontSize(fontSize - 1);
    }
  }, [fontSize, text]);

  return (
    <div ref={divRef} style={{ fontSize: `${fontSize}%` }}>
      {text}
    </div>
  );
}
