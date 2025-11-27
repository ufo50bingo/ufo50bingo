import classes from "./SideColumn.module.css";
import { ReactNode } from "react";

type Props = {
    children: ReactNode;
}

export default function SideColumn({ children }: Props) {
    return <div className={classes.container}>{children}</div>;
}