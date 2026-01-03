"use client";

import { UFOPasta } from "./generator/ufoGenerator";

const CACHE: Array<[UFOPasta, ProcessedPasta]> = [];

export type FoundGoal<G extends string, C extends string, S extends string> = {
  goal: G;
  resolvedGoal: string;
  category: C;
  subcategory: S;
  tokens: ReadonlyArray<string>;
};
type Tags = { category: string; subcategory: string };
type Plain = { [goal: string]: Tags };
interface WithTokenNoTags {
  regex: RegExp;
  goal: string;
  tokens: ReadonlyArray<string>;
}
interface WithToken extends WithTokenNoTags {
  tags: Tags;
}
type WithTokens = Array<WithToken>;
type ProcessedPasta = {
  plain: Plain;
  withTokens: WithTokens;
};

export default function findGoal(
  goal: string,
  pasta: UFOPasta
): null | FoundGoal<string, string, string> {
  let processed = CACHE.find((item) => item[0] === pasta)?.[1];
  if (processed == null) {
    processed = preprocess(pasta);
    CACHE.push([pasta, processed]);
  }
  const plainResult = processed.plain[goal];
  if (plainResult != null) {
    return {
      goal,
      resolvedGoal: goal,
      category: plainResult.category,
      subcategory: plainResult.subcategory,
      tokens: [],
    };
  }
  for (const option of processed.withTokens) {
    const match = goal.match(option.regex);
    if (match != null) {
      return {
        goal: option.goal,
        resolvedGoal: goal,
        category: option.tags.category,
        subcategory: option.tags.subcategory,
        tokens: match.slice(1),
      };
    }
  }
  return null;
}

const TOKEN_REGEX = /\{\{([^{}]*)\}\}/g;
function preprocessGoalWithToken(
  goal: string,
  pasta: UFOPasta
): WithTokenNoTags {
  const matches = goal.matchAll(TOKEN_REGEX);
  // token locations should all be disjoint since they cannot be nested
  let regexStr = "";
  let startIndex = 0;
  const tokens: Array<string> = [];
  for (const match of matches) {
    // @ts-expect-error RegExp.escape exists on all modern browsers
    regexStr += RegExp.escape(goal.slice(startIndex, match.index));
    startIndex = match.index + match[0].length;
    tokens.push(match[1]);
    const tokenOptions = pasta.tokens[match[1]];
    const tokenRegex = tokenOptions
      .map((option) =>
        // @ts-expect-error RegExp.escape exists on all modern browsers
        RegExp.escape(option)
      )
      .join("|");
    regexStr += "(" + tokenRegex + ")";
  }
  // @ts-expect-error RegExp.escape exists on all modern browsers
  regexStr += RegExp.escape(goal.slice(startIndex, goal.length));

  return {
    regex: RegExp(regexStr),
    goal,
    tokens,
  };
}

function preprocess(pasta: UFOPasta): ProcessedPasta {
  const plain: Plain = {};
  const withTokens: WithTokens = [];
  Object.keys(pasta.goals).forEach((category) => {
    Object.keys(pasta.goals[category]).forEach((subcategory) => {
      pasta.goals[category][subcategory].forEach((goal) => {
        const tags = { category, subcategory };
        if (goal.includes("{{")) {
          const output = preprocessGoalWithToken(goal, pasta);
          withTokens.push({ ...output, tags });
        }
        plain[goal] = tags;
        return;
      });
    });
  });
  return { plain, withTokens };
}
