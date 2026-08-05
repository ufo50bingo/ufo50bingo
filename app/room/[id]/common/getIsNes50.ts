import findGoal from "@/app/findGoal";
import { TBoard } from "@/app/matches/parseBingosyncData";
import { NES_50_UFO } from "@/app/pastas/nes50Ufo";

export default function getIsNes50(board: TBoard): boolean {
  let foundCount = 0;
  for (const square of board) {
    if (findGoal(square.name, NES_50_UFO) != null) {
      foundCount += 1;
    }
    if (foundCount >= 10) {
      return true;
    }
  }
  return false;
}