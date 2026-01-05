import resolveTokens from "./resolveTokens";
import splitAtTokens from "./splitAtTokens";
import { Tokens } from "./ufoGenerator";

export default function replaceTokens(goal: string, tokens: Tokens): string {
  const parts = splitAtTokens(goal);
  return resolveTokens(parts, tokens)
    .map((part) => part.text)
    .join("");
}
