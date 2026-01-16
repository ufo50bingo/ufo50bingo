import { DIFFICULTY_NAMES } from "../goals";

export default function getCategoryName(category: string): string {
  const officialName = DIFFICULTY_NAMES[category];
  return officialName ?? category;
}
