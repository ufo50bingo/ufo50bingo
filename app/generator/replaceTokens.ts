import resolveTokens from "./resolveTokens";
import splitAtTokens from "./splitAtTokens";
import { UFOPasta } from "./ufoGenerator";

export default function replaceTokens(
  goal: string,
  pasta: UFOPasta,
  sortTokens: null | undefined | string | ReadonlyArray<string>,
): string {
  const parts = splitAtTokens(goal);
  return resolveTokens(parts, pasta, sortTokens)
    .map((part) => part.text)
    .join("");
}
