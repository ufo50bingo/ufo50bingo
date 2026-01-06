import {
  compareByDifficulty,
  ORDERED_SUBCATEGORIES,
  StandardGoal,
} from "../goals";

export default function compareByDefault(a: StandardGoal, b: StandardGoal) {
  const subcatDiff =
    ORDERED_SUBCATEGORIES.indexOf(a.subcategory) -
    ORDERED_SUBCATEGORIES.indexOf(b.subcategory);
  if (subcatDiff !== 0) {
    return subcatDiff;
  }
  const difficultyDiff = compareByDifficulty(a, b);
  if (difficultyDiff != 0) {
    return difficultyDiff;
  }
  return a.name.localeCompare(b.name);
}
