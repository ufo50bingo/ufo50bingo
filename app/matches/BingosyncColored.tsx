import { ReactNode } from "react";
import classes from "./BingosyncColored.module.css";
import { BingosyncColor } from "./parseBingosyncData";

type Props = {
  color: BingosyncColor;
  children: ReactNode;
};

export function getColorClass(color: BingosyncColor): string {
  switch (color) {
    case "blank":
      return classes.blankplayer;
    case "red":
      return classes.redplayer;
    case "blue":
      return classes.blueplayer;
    case "green":
      return classes.greenplayer;
    case "orange":
      return classes.orangeplayer;
    case "purple":
      return classes.purpleplayer;
    case "navy":
      return classes.navyplayer;
    case "teal":
      return classes.tealplayer;
    case "pink":
      return classes.pinkplayer;
    case "brown":
      return classes.brownplayer;
    case "yellow":
      return classes.yellowplayer;
  }
}

export default function BingosyncColored({ color, children }: Props) {
  return <span className={getColorClass(color)}>{children}</span>;
}
