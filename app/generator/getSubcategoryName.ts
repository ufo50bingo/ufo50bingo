import { SUBCATEGORY_NAMES } from "../goals";

export default function getSubcategoryName(subcategory: string): string {
  const officialName = SUBCATEGORY_NAMES[subcategory];
  return officialName ?? subcategory;
}
