import React, { ReactNode } from "react";

type Props = {
  children: ReactNode;
  rows?: number;
  columns?: number;
};

export default function StandardBoardWrapper({
  children,
  rows = 5,
  columns = 5,
}: Props) {
  return (
    <div
      style={{
        maxWidth: "100%",
        width: `${105 * columns}px`,
        height: `${95 * rows}px`,
      }}
    >
      {children}
    </div>
  );
}
