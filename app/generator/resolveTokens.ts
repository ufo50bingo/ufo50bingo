import getGoalText from "./getGoalText";
import { Plain, BaseToken, ResolvedToken } from "./splitAtTokens";
import { Tokens } from "./ufoGenerator";

export default function resolveTokens(
  parts: ReadonlyArray<Plain | BaseToken>,
  tokens: Tokens
): Array<Plain | ResolvedToken> {
  const remainingTokens = { ...tokens };
  return parts.map((part) => {
    if (part.type === "plain") {
      return part;
    } else {
      const values = remainingTokens[part.token];
      if (values == null) {
        throw new Error(
          `No values defined for token {{${part.token}}} in goal "${getGoalText(
            parts
          )}"`
        );
      }
      if (values.length === 0) {
        throw new Error(
          `Not enough values specified for token {{${
            part.token
          }}} in goal "${getGoalText(parts)}"`
        );
      }
      const valueIndex = Math.floor(Math.random() * values.length);
      const tokenValue = values[valueIndex];
      remainingTokens[part.token] = values.toSpliced(valueIndex, 1);
      return {
        type: "resolved",
        token: part.token,
        text: tokenValue,
      };
    }
  });
}
