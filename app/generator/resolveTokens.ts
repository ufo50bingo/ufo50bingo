import getGoalText from "./getGoalText";
import { Plain, BaseToken, ResolvedToken } from "./splitAtTokens";
import { UFOPasta } from "./ufoGenerator";

export default function resolveTokens(
  parts: ReadonlyArray<Plain | BaseToken | ResolvedToken>,
  pasta: UFOPasta,
  sortTokens: undefined | null | string | ReadonlyArray<string>,
): Array<Plain | ResolvedToken> {
  const remainingTokens = { ...pasta.tokens };
  parts
    .filter((part) => part.type === "resolved")
    .forEach((resolved) => {
      const relevantTokens = remainingTokens[resolved.token];
      relevantTokens.filter((value) => value !== resolved.text);
      remainingTokens[resolved.token] = relevantTokens;
    });
  const resolvedParts: Array<Plain | ResolvedToken> = parts.map((part) => {
    if (part.type === "plain" || part.type === "resolved") {
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
          `Not enough values specified for token {{${part.token
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
  if (sortTokens == null) {
    return resolvedParts;
  }
  const sorted = getSorted(
    resolvedParts.filter(p => p.type === "resolved"),
    pasta,
    sortTokens,
  );

  let curIdx = 0;
  return resolvedParts.map(p => {
    if (p.type === "plain") {
      return p;
    }
    const nextPart = sorted[curIdx];
    curIdx += 1;
    return nextPart;
  });
}

function getSorted(
  resolvedTokens: ReadonlyArray<ResolvedToken>,
  pasta: UFOPasta,
  sortTokens: string | ReadonlyArray<string>,
): ReadonlyArray<ResolvedToken> {
  // special sort
  if (sortTokens === "$numeric") {
    return resolvedTokens.toSorted((a, b) => Number(a.text) - Number(b.text));
  }
  let sortKey: ReadonlyArray<string>;
  if (typeof sortTokens === "string") {
    const sortOrders = pasta.sort_orders?.[sortTokens];
    if (sortOrders == null) {
      throw new Error(`Undefined sort order: ${sortTokens}`);
    }
    sortKey = sortOrders;
  } else {
    sortKey = sortTokens;
  }
  return resolvedTokens.toSorted((a, b) => sortKey.indexOf(a.text) - sortKey.indexOf(b.text));
}