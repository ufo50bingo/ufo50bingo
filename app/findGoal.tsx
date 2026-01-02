"use client";

import { UFOPasta } from "./generator/ufoGenerator";

type FoundGoal = {
  goal: string;
  category: string;
  subcategory: string;
  tokens: { [tokenName: string]: ReadonlyArray<string> };
};

export default function findGoal(
  goal: string,
  pasta: UFOPasta
): null | FoundGoal {
  return null;
}

const TOKEN_REGEX = /\{\{([^{}]*)\}\}/g;

type Tags = { category: string, subcategory: string };
type Plain = { [goal: string]: Tags };
interface WithTokenNoTags {
  regex: RegExp,
  goal: string,
  tokens: ReadonlyArray<string>,
};
interface WithToken extends WithTokenNoTags {
  tags: Tags,
}
type WithTokens = Array<WithToken>;

function preprocessGoalWithToken(goal: string, pasta: UFOPasta): WithTokenNoTags {
  const matches = goal.matchAll(TOKEN_REGEX);
  // token locations should all be disjoint since they cannot be nested
  let regexStr = '';
  let startIndex = 0;
  const tokens: Array<string> = [];
  for (const match of matches) {
    // @ts-ignore RegExp.escape exists on all modern browsers
    regexStr += RegExp.escape(goal.slice(startIndex, match.index));
    startIndex = match.index + match[0].length;
    tokens.push(match[1]);
    const tokenOptions = pasta.tokens[match[1]];
    const tokenRegex = tokenOptions.map(option =>
      // @ts-ignore RegExp.escape exists on all modern browsers
      RegExp.escape(option)
    ).join('|');
    regexStr += '(' + tokenRegex + ')';
  }
  // @ts-ignore RegExp.escape exists on all modern browsers
  regexStr += RegExp.escape(goal.slice(startIndex, goal.length));

  console.log(regexStr);
  return {
    regex: RegExp(regexStr),
    goal,
    tokens
  };
}

function preprocess(pasta: UFOPasta): [Plain, WithTokens] {
  const plain: Plain = {};
  const withTokens: WithTokens = [];
  const tokens = pasta.tokens;
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
  return [plain, withTokens];
}
