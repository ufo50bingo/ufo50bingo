import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  rows?: number;
  columns?: number;
  minSquareWidth?: number;
};

export default function StandardBoardWrapper({
  children,
  rows = 5,
  columns = 5,
  minSquareWidth,
}: Props) {
  return (
    <div
      style={{
        maxWidth: "100%",
        width: `${105 * columns}px`,
        minWidth:
          minSquareWidth != null ? `${minSquareWidth * columns}px` : undefined,
        height: `${95 * rows}px`,
      }}
    >
      {children}
    </div>
  );
}
