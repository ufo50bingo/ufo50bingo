import findGoal from "@/app/findGoal";
import { NES_50_UFO } from "@/app/pastas/nes50Ufo";

export default function getIsNes50(board: ReadonlyArray<string>): boolean {
  let foundCount = 0;
  for (const name of board) {
    if (findGoal(name, NES_50_UFO) != null) {
      foundCount += 1;
    }
    if (foundCount >= 10) {
      return true;
    }
  }
  return false;
}
