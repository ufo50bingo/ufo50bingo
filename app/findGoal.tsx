"use client";

import getGoalAndFallback from "./generator/getGoalAndFallback";
import { UFOPasta } from "./generator/ufoGenerator";
import regexpEscape from "regexp.escape";

const CACHE: Array<
  [
    UFOPasta,
    [ProcessedPasta, Map<string, null | FoundGoal<string, string, string>>],
  ]
> = [];

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
  pasta: UFOPasta,
): null | FoundGoal<string, string, string> {
  let cached = CACHE.find((item) => item[0] === pasta)?.[1];
  if (cached == null) {
    cached = [preprocess(pasta), new Map()];
    CACHE.push([pasta, cached]);
  }
  const [processed, goalCache] = cached;

  const cacheResult = goalCache.get(goal);
  if (cacheResult !== undefined) {
    return cacheResult;
  }

  const plainResult = processed.plain[goal];
  if (plainResult != null) {
    const res = {
      goal,
      resolvedGoal: goal,
      category: plainResult.category,
      subcategory: plainResult.subcategory,
      tokens: [],
    };
    goalCache.set(goal, res);
    return res;
  }
  for (const option of processed.withTokens) {
    const match = goal.match(option.regex);
    if (match != null) {
      const res = {
        goal: option.goal,
        resolvedGoal: goal,
        category: option.tags.category,
        subcategory: option.tags.subcategory,
        tokens: match.slice(1),
      };
      goalCache.set(goal, res);
      return res;
    }
  }
  goalCache.set(goal, null);
  return null;
}

function escape(str: string): string {
  // @ts-expect-error RegExp.escape exists on all modern browsers
  if (typeof RegExp.escape === "function") {
    // @ts-expect-error RegExp.escape exists on all modern browsers
    return RegExp.escape(str);
  } else {
    return regexpEscape(str);
  }
}

const TOKEN_REGEX = /\{\{([^{}]*)\}\}/g;
function preprocessGoalWithToken(
  goal: string,
  pasta: UFOPasta,
): WithTokenNoTags {
  const matches = goal.matchAll(TOKEN_REGEX);
  // token locations should all be disjoint since they cannot be nested
  let regexStr = "";
  let startIndex = 0;
  const tokens: Array<string> = [];
  for (const match of matches) {
    regexStr += escape(goal.slice(startIndex, match.index));
    startIndex = match.index + match[0].length;
    tokens.push(match[1]);
    const tokenOptions = pasta.tokens[match[1]];
    const tokenRegex = tokenOptions.map((option) => escape(option)).join("|");
    regexStr += "(" + tokenRegex + ")";
  }
  regexStr += escape(goal.slice(startIndex, goal.length));

  return {
    regex: RegExp("^" + regexStr + "$"),
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
        const goalName = getGoalAndFallback(goal)[0];
        const tags = { category, subcategory };
        if (goalName.includes("{{")) {
          const output = preprocessGoalWithToken(goalName, pasta);
          withTokens.push({ ...output, tags });
        }
        plain[goalName] = tags;
        return;
      });
    });
  });
  return { plain, withTokens };
}
