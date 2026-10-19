import { BingosyncColor } from "./matches/parseBingosyncData";
import getColorHex from "./room/[id]/cast/getColorHex";

type Props = {
  color: BingosyncColor;
  className?: string;
};

export default function HeldHandIcon({ color, className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* copied from tabler hand icon svg. First is color fill and others are outline strokes */}
      <path d="M8 13v-7.5a1.5 1.5 0 0 1 3 0v-2a1.5 1.5 0 0 1 3 0v2a1.5 1.5 0 0 1 3 0v2a1.5 1.5 0 0 1 3 0v8.5a6 6 0 0 1 -6 6h-1.792a6 6 0 0 1 -5.012 -2.7a69.74 69.74 0 0 1 -.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28z" fill={getColorHex(color)} stroke="none" />
      <path d="M8 13v-7.5a1.5 1.5 0 0 1 3 0v6.5" />
      <path d="M11 5.5v-2a1.5 1.5 0 1 1 3 0v8.5" />
      <path d="M14 5.5a1.5 1.5 0 0 1 3 0v6.5" />
      <path d="M17 7.5a1.5 1.5 0 0 1 3 0v8.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7a69.74 69.74 0 0 1 -.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47" />
    </svg>
  );
}
