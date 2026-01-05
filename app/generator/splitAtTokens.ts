export interface Plain {
  type: "plain";
  text: string;
}

export interface BaseToken {
  type: "token";
  token: string;
}

export interface ResolvedToken {
  type: "resolved";
  token: string;
  text: string;
}

const REGEX = /\{\{([^{}]*)\}\}/g;
export default function splitAtTokens(
  goal: string
): ReadonlyArray<Plain | BaseToken> {
  const matches = goal.matchAll(REGEX);
  const parts: Array<Plain | BaseToken> = [];
  let prevTokenEnd = 0;
  for (const match of matches) {
    if (match.index > prevTokenEnd) {
      parts.push({
        type: "plain",
        text: goal.substring(prevTokenEnd, match.index),
      });
    }
    parts.push({
      type: "token",
      token: match[1],
    });
    prevTokenEnd = match.index + match[0].length;
  }
  if (prevTokenEnd < goal.length) {
    parts.push({
      type: "plain",
      text: goal.substring(prevTokenEnd),
    });
  }
  return parts;
}
