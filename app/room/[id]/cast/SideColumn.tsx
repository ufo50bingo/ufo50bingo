import classes from "./SideColumn.module.css";
import { ReactNode } from "react";

type Props = {
    children: ReactNode;
    isDouble: boolean;
}

export default function SideColumn({ children, isDouble }: Props) {
    const widthClass = isDouble ? classes.sidebyside : classes.normal;
    return <div className={`${classes.container} ${widthClass}`}>{children}</div>;
}