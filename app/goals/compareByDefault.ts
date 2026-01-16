import { UFOGoal } from "../generator/getFlatGoals";
import {
  compareByDifficulty,
  ORDERED_SUBCATEGORIES,
} from "../goals";

export default function compareByDefault(a: UFOGoal, b: UFOGoal) {
  if (a.subcategory === b.subcategory) {
    const difficultyDiff = compareByDifficulty(a, b);
    if (difficultyDiff != 0) {
      return difficultyDiff;
    }
  }
  const aSubcatIdx = ORDERED_SUBCATEGORIES.indexOf(a.subcategory);
  const bSubcatIdx = ORDERED_SUBCATEGORIES.indexOf(b.subcategory);
  if (aSubcatIdx === bSubcatIdx) {
    return a.name.localeCompare(b.name);
  } else if (aSubcatIdx >= 0 && bSubcatIdx >= 0) {
    return aSubcatIdx - bSubcatIdx;
  } else if (aSubcatIdx >= 0) {
    return -1;
  } else if (bSubcatIdx >= 0) {
    return 1;
  } else {
    return 0;
  }
}
