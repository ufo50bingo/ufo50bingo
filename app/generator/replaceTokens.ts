import { Tokens } from "./ufoGenerator";

const REGEX = /\{\{([^{}]*)\}\}/;

export default function replaceTokens(goal: string, tokens: Tokens): string {
  let final = goal;
  const remainingTokens = { ...tokens };

  let match = final.match(REGEX);
  while (match != null) {
    const tokenName = match[1];
    const values = remainingTokens[tokenName];
    if (values == null) {
      throw new Error(
        `No values defined for token ${match[0]} in goal "${goal}"`
      );
    }
    if (values.length === 0) {
      throw new Error(
        `Not enough values specified for token ${match[0]} in goal "${goal}"`
      );
    }
    const valueIndex = Math.floor(Math.random() * values.length);
    const tokenValue = values[valueIndex];
    remainingTokens[tokenName] = values.toSpliced(valueIndex, 1);

    // since we aren't using the g flag, index is guaranteed to exist
    const matchIndex = match.index!;
    final =
      final.substring(0, matchIndex) +
      tokenValue +
      final.substring(matchIndex + match[0].length);
    match = final.match(REGEX);
  }
  return final;
}
