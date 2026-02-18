import getCategoryName from "./getCategoryName";
import splitAtTokens from "./splitAtTokens";
import {
  Counts,
  Tokens,
  UFODifficulties,
  UFOGoalConfig,
  UFOPasta,
} from "./ufoGenerator";

export default function addPrefixToPasta(
  pasta: UFOPasta,
  prefix: string,
): UFOPasta {
  const goals: UFODifficulties = {};
  for (const [category, subcategories] of Object.entries(pasta.goals)) {
    const newCategory = getNewCategory(category, prefix);
    const newSubcategories: {
      [subcategory: string]: Array<string | UFOGoalConfig>;
    } = {};
    for (const [subcategory, goals] of Object.entries(subcategories)) {
      newSubcategories[subcategory] = goals.map((goal) => {
        if (typeof goal === "string") {
          return addPrefixToTokens(goal, prefix);
        }
        let sort_tokens = undefined;
        if (goal.sort_tokens != null) {
          sort_tokens =
            typeof goal.sort_tokens === "string" &&
            goal.sort_tokens !== "$numeric"
              ? addPrefixToIdent(goal.sort_tokens, prefix)
              : goal.sort_tokens;
        }
        let restriction = undefined;
        if (goal.restriction != null) {
          const fallback = addPrefixToTokens(goal.restriction.fallback, prefix);
          const options =
            typeof goal.restriction.options === "string"
              ? addPrefixToIdent(goal.restriction.options, prefix)
              : goal.restriction.options;
          restriction = {
            count: goal.restriction.count,
            fallback,
            options,
          };
        }
        const newConfig: UFOGoalConfig = {
          name: addPrefixToTokens(goal.name, prefix),
          sort_tokens,
          restriction,
        };
        return newConfig;
      });
    }
    goals[newCategory] = newSubcategories;
  }

  const tokens: Tokens = {};
  for (const [token, values] of Object.entries(pasta.tokens)) {
    tokens[addPrefixToIdent(token, prefix)] = values;
  }

  const category_counts: Counts = {};
  for (const [category, count] of Object.entries(pasta.category_counts)) {
    category_counts[getNewCategory(category, prefix)] = count;
  }

  const category_difficulty_tiers =
    pasta.category_difficulty_tiers != null
      ? pasta.category_difficulty_tiers.map((tier) =>
          tier.map((category) => getNewCategory(category, prefix)),
        )
      : undefined;

  const restriction_option_lists =
    pasta.restriction_option_lists != null
      ? Object.fromEntries(
          Object.entries(pasta.restriction_option_lists).map(
            ([listName, options]) => [
              addPrefixToIdent(listName, prefix),
              options,
            ],
          ),
        )
      : undefined;

  const sort_orders =
    pasta.sort_orders != null
      ? Object.fromEntries(
          Object.entries(pasta.sort_orders).map(([listName, options]) => [
            addPrefixToIdent(listName, prefix),
            options,
          ]),
        )
      : undefined;

  const draft =
    pasta.draft != null
      ? {
          excluded_categories: pasta.draft.excluded_categories.map((category) =>
            getNewCategory(category, prefix),
          ),
          category_counts: pasta.draft.category_counts.map(
            (categoryCountsForPlayer) =>
              Object.fromEntries(
                Object.entries(categoryCountsForPlayer).map(
                  ([category, count]) => [
                    getNewCategory(category, prefix),
                    count,
                  ],
                ),
              ),
          ),
        }
      : undefined;

  return {
    goals,
    tokens,
    category_counts,
    category_difficulty_tiers,
    restriction_option_lists,
    sort_orders,
    draft,
  };
}

function getNewCategory(oldCategory: string, prefix: string): string {
  return `${prefix} ${getCategoryName(oldCategory)}`;
}

function addPrefixToIdent(ident: string, prefix: string): string {
  return `${prefix}_${ident}`;
}

function addPrefixToTokens(goal: string, prefix: string): string {
  const split = splitAtTokens(goal);
  return split
    .map((part) =>
      part.type === "plain"
        ? part.text
        : `{{${addPrefixToIdent(part.token, prefix)}}}`,
    )
    .join("");
}
