import { BingosyncColor } from "@/app/matches/parseBingosyncData";

export default function getColorHex(color: BingosyncColor): string {
  switch (color) {
    case "blank":
      return "#c8c8c8";
    case "green":
      return "#62c462";
    case "red":
      return "#ee5f5b";
    case "orange":
      return "#f89406";
    case "blue":
      return "#5bc0de";
    case "purple":
      return "#822dbf";
    case "navy":
      return "#0d48b5";
    case "teal":
      return "#419695";
    case "pink":
      return "#de799c";
    case "brown":
      return "#ab5c23";
    case "yellow":
      return "#c1ba0b";
  }
}