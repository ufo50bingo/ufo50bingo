"use client";

import getGoalAndFallback from "./generator/getGoalAndFallback";
import splitAtTokens, { Plain, ResolvedToken } from "./generator/splitAtTokens";
import { Tokens, UFOGoalConfig, UFOPasta } from "./generator/ufoGenerator";
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
  sortTokens?: string | ReadonlyArray<string>;
  category: C;
  subcategory: S;
  tokens: ReadonlyArray<string>;
  goalParts: ReadonlyArray<Plain | ResolvedToken>;
};
type Tags = { category: string; subcategory: string };
type PlainText = { [goal: string]: Tags };
interface WithTokenNoTags {
  regex: RegExp;
  sortTokens?: string | ReadonlyArray<string>;
  goal: string;
  tokens: ReadonlyArray<string>;
}
interface WithToken extends WithTokenNoTags {
  tags: Tags;
}
type WithTokens = Array<WithToken>;
type ProcessedPasta = {
  plain: PlainText;
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
    const part: Plain = { type: "plain", text: goal };
    const res = {
      goal,
      resolvedGoal: goal,
      category: plainResult.category,
      subcategory: plainResult.subcategory,
      tokens: [],
      goalParts: [part],
    };
    goalCache.set(goal, res);
    return res;
  }
  for (const option of processed.withTokens) {
    const goalParts = getGoalPartsFromToken(goal, option, pasta.tokens);
    if (goalParts != null) {
      const res = {
        goal: option.goal,
        resolvedGoal: goal,
        category: option.tags.category,
        subcategory: option.tags.subcategory,
        tokens: goalParts.filter(p => p.type === "resolved").map(p => p.text),
        goalParts,
        sortTokens: option.sortTokens,
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
  goal: string | UFOGoalConfig,
  pasta: UFOPasta,
): WithTokenNoTags {
  const sortTokens = typeof goal === "string" ? undefined : goal?.sort_tokens;
  const goalName = typeof goal === "string" ? goal : goal.name;
  const matches = [...goalName.matchAll(TOKEN_REGEX)];
  // token locations should all be disjoint since they cannot be nested
  let regexStr = "";
  let startIndex = 0;
  const tokens = matches.map(match => match[1]);
  let combinedOptions = undefined;
  if (sortTokens != null) {
    const uniqueTokens = [...new Set(tokens)];
    combinedOptions = uniqueTokens.flatMap(t => pasta.tokens[t]);
  }
  for (const match of matches) {
    regexStr += escape(goalName.slice(startIndex, match.index));
    startIndex = match.index + match[0].length;
    const tokenOptions = combinedOptions == null ? pasta.tokens[match[1]] : combinedOptions;
    const tokenRegex = tokenOptions.map((option) => escape(option)).join("|");
    regexStr += "(" + tokenRegex + ")";
  }
  regexStr += escape(goalName.slice(startIndex, goalName.length));

  return {
    regex: RegExp("^" + regexStr + "$"),
    goal: goalName,
    tokens,
    sortTokens,
  };
}

function preprocess(pasta: UFOPasta): ProcessedPasta {
  const plain: PlainText = {};
  const withTokens: WithTokens = [];
  Object.keys(pasta.goals).forEach((category) => {
    Object.keys(pasta.goals[category]).forEach((subcategory) => {
      pasta.goals[category][subcategory].forEach((goal) => {
        const goalName = getGoalAndFallback(goal)[0];
        const tags = { category, subcategory };
        if (goalName.includes("{{")) {
          const output = preprocessGoalWithToken(goal, pasta);
          withTokens.push({ ...output, tags });
        }
        plain[goalName] = tags;
        return;
      });
    });
  });
  return { plain, withTokens };
}

function getGoalPartsFromToken(goal: string, option: WithToken, tokenOptions: Tokens): null | Array<Plain | ResolvedToken> {
  const match = goal.match(option.regex);
  if (match == null) {
    return null;
  }
  const parts = splitAtTokens(option.goal);
  if (option.sortTokens == null) {
    const final: Array<Plain | ResolvedToken> = [];
    let curMatch = 1;
    for (const part of parts) {
      if (part.type === "plain") {
        final.push(part);
      } else {
        final.push({ type: "resolved", token: part.token, text: match[curMatch] });
        curMatch += 1;
      }
    }
    return final;
  }
  const allTokens = parts.filter(p => p.type === "token").map(p => p.token);
  const allTokenValues = match.slice(1);
  const assignment = assignTextToTokens(allTokenValues, allTokens, tokenOptions);
  if (assignment == null) {
    return null;
  }
  const final: Array<Plain | ResolvedToken> = [];
  let curMatch = 0;
  for (const part of parts) {
    if (part.type === "plain") {
      final.push(part);
    } else {
      final.push({ type: "resolved", token: assignment[curMatch], text: allTokenValues[curMatch] });
      curMatch += 1;
    }
  }
  return final;
}

// values is an array of actual text matched to token slots by the regex
// tokens is a list of all tokens used in the original goal
// returns an array assigning each value to a particular token or null if impossible
function assignTextToTokens(values: ReadonlyArray<string>, tokens: ReadonlyArray<string>, tokenOptions: Tokens): null | ReadonlyArray<string> {
  const tokenCounts: { [token: string]: number } = {};
  for (const token of tokens) {
    tokenCounts[token] = (tokenCounts[token] ?? 0) + 1;
  }
  const finalAssignment = values.map(v => "");
  const uniqueTokens = [...new Set(tokens)];
  const validTokensByIndex = values.map(v => uniqueTokens.filter(t => tokenOptions[t].includes(v)));

  const tryAssignment = (index: number): boolean => {
    for (const token of validTokensByIndex[index]) {
      if (tokenCounts[token] > 0) {
        // try assigning this index to `token`
        tokenCounts[token] -= 1;
        finalAssignment[index] = token;

        if (index === values.length - 1 || tryAssignment(index + 1)) {
          return true;
        }

        // this assignment didn't work, so reset the state and
        // try the next token
        tokenCounts[token] += 1;
        finalAssignment[index] = "";
      }
    }

    return false;
  };

  return tryAssignment(0) ? finalAssignment : null;
}
