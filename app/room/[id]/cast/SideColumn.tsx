import classes from "./SideColumn.module.css";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  isDouble: boolean;
  rows: number;
};

export default function SideColumn({ children, isDouble, rows }: Props) {
  const widthClass = isDouble ? classes.sidebyside : classes.normal;
  return (
    <div
      style={{ height: `${rows * 95}px` }}
      className={`${classes.container} ${widthClass}`}
    >
      {children}
    </div>
  );
}
