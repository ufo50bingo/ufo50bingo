import classes from "./SideCell.module.css";
import { ReactNode } from "react";

type Props = {
    children: ReactNode;
}

export default function SideCell({ children }: Props) {
    return <div className={classes.root}>{children}</div>;
}