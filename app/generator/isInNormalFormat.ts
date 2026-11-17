import { UFOPasta } from "./ufoGenerator";

export default function isInNormalFormat(
  category: string,
  pasta: UFOPasta,
): boolean {
  return (pasta.category_counts[category] ?? 0) > 0;
}
