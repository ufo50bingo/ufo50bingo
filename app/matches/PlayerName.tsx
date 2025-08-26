import { ReactNode } from "react";
import { BingosyncColor } from "./refreshMatch";
import classes from "./PlayerName.module.css";

type Props = {
  color: ReadonlyArray<BingosyncColor>;
  children: ReactNode;
};

function getColorClass(color: ReadonlyArray<BingosyncColor>): string {
  const firstColor = color[0];

  switch (firstColor) {
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

export default function PlayerName({ color, children }: Props) {
  return <span className={getColorClass(color)}>{children}</span>;
}
