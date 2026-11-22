import { WinType } from "./matchUtil";

type Props = {
  size: number;
  color: string;
  winType: WinType;
};

const WIDTH = 6;
const GAP = 3;

const BINGO = [
  [0, 0],
  [1, 1],
  [2, 2],
];

const MAJORITY = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 2],
  [2, 1],
];

const TIEBREAK = [
  [0, 1],
  [1, 0],
  [2, 2],
];

export default function BingoIcon({ size, color, winType }: Props) {
  const coloredList =
    winType === "Bingo" ? BINGO : winType === "Majority" ? MAJORITY : TIEBREAK;
  const cells = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const isColored = coloredList.some(([mr, mc]) => mr === r && mc === c);
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={c * (WIDTH + GAP)}
          y={r * (WIDTH + GAP)}
          width={WIDTH}
          height={WIDTH}
          rx={0.7}
          fill={isColored ? color : "currentColor"}
          opacity={isColored ? 1 : 0.3}
        />,
      );
    }
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label="Bingo"
      style={{ display: "block" }}
    >
      {cells}
    </svg>
  );
}
