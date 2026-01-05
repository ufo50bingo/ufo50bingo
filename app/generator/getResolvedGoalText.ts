import { Plain, BaseToken, ResolvedToken } from "./splitAtTokens";

export default function getResolvedGoalText(
  parts: ReadonlyArray<Plain | BaseToken | ResolvedToken>
): string {
  return parts
    .map((part) => {
      if (part.type === "plain" || part.type === "resolved") {
        return part.text;
      } else {
        return "{{" + part.token + "}}";
      }
    })
    .join("");
}
