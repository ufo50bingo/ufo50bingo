import { UFODifficulties } from "../generator/ufoGenerator";

export default function getAllSubcategories(
  ufoDifficulties: UFODifficulties,
  categories: ReadonlyArray<string>,
): Set<string> {
  const subcategories: Set<string> = new Set();
  for (const category of categories) {
    for (const subcategory of Object.keys(ufoDifficulties[category])) {
      subcategories.add(subcategory);
    }
  }
  return subcategories;
}