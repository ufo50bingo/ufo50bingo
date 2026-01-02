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

const TOKEN_REGEX = /\{\{([^{}]*)\}\}/;
// [category, subcategory]
type Plain = { [goal: string]: [string, string] };
type WithTokens = Array<[RegExp, string, [string, string]]>;

function preprocess(pasta: UFOPasta): unknown {
  const plain: Plain = {};
  const withTokens: WithTokens = [];
  const tokens = pasta.tokens;
  Object.keys(pasta.goals).forEach((category) => {
    Object.keys(pasta.goals[category]).forEach((subcategory) => {
      pasta.goals[category][subcategory].forEach((goal) => {
        if (goal.includes("{{")) {
          const match = goal.match(TOKEN_REGEX);
          if (match != null) {
            // ???
            return;
          }
        }
        plain[goal] = [category, subcategory];
        return;
      });
    });
  });
}
