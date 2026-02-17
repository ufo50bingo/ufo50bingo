import { UFOPasta } from "./ufoGenerator";
import findAllTokens from "./findAllTokens";
import { Return } from "./validateStr";
import findAllGoalsWithSortedTokens from "./findAllGoalsWithSortedTokens";
import splitAtTokens from "./splitAtTokens";

export default function validateUfo(pasta: UFOPasta): Return {
  try {
    const warnings: Array<string> = [];
    const errors: Array<string> = [];

    const maxTokenCounts = findAllTokens(pasta.goals);
    // are all used tokens defined properly?
    Object.keys(maxTokenCounts).forEach((token) => {
      const maxCount = maxTokenCounts[token];
      const options = pasta.tokens[token];
      if (options == null) {
        errors.push(
          `✖ Token "${token}" appears in a goal but does not have options specified in the "tokens" object.`,
        );
      } else if (options.length < maxCount) {
        const allOptions = options.map((option) => `"${option}"`).join(", ");
        errors.push(
          `✖ Token "${token}" appears in a goal ${maxCount} times, but only has ${options.length} options in its definition in the "tokens" object [${allOptions}]`,
        );
      }
    });
    // are there any unused tokens?
    Object.keys(pasta.tokens).forEach((token) => {
      if (maxTokenCounts[token] == null) {
        warnings.push(
          `⚠ Token "${token}" is defined in the "tokens" object but is not used in any goals`,
        );
      }
    });
    // do categories add up properly?
    const categorySum = Object.values(pasta.category_counts).reduce(
      (acc, count) => acc + count,
    );
    if (categorySum !== 25) {
      errors.push(`✖ category_counts sum must be 25, but got ${categorySum}`);
    }
    // are all categories actually in the goals list?
    Object.keys(pasta.category_counts).forEach((category) => {
      const count = pasta.category_counts[category];
      if (count === 0) {
        return;
      }
      const goals = pasta.goals[category];
      if (goals == null) {
        errors.push(
          `✖ Category "${category}" has count ${count} but does not appear in the "goals" object`,
        );
        return;
      }
      const numGoals = Object.values(goals).reduce(
        (acc, goalList) => acc + goalList.length,
        0,
      );
      if (numGoals < count) {
        errors.push(
          `✖ Category "${category}" has count ${count} but only has ${numGoals} goals in the "goals" object`,
        );
      }
    });
    // are any categories missing from category_counts?
    Object.keys(pasta.goals).forEach((category) => {
      if (pasta.category_counts[category] == null) {
        warnings.push(
          `⚠ Category "${category}" appears in the "goals" object but not in the "category_counts" object`,
        );
      }
    });
    // are any categories present in category_difficulty_tiers but not category_counts?
    (pasta.category_difficulty_tiers ?? []).forEach((tier) => {
      tier.forEach((category) => {
        if (pasta.category_counts[category] == null) {
          warnings.push(
            `⚠ Category "${category}" appears in the "category_difficulty_tiers" object but not the "category_counts" object`,
          );
        }
      });
    });
    // validations for goals with sorted tokens
    const goalsWithSortedTokens = findAllGoalsWithSortedTokens(pasta.goals);
    for (const goal of goalsWithSortedTokens) {
      const sortTokens = goal.sort_tokens!;
      // are any definitions missing?
      if (
        typeof sortTokens === "string" &&
        sortTokens !== "$numeric" &&
        pasta.sort_orders?.[sortTokens] == null
      ) {
        errors.push(
          `✖ Sort order "${sortTokens}" is not defined in the sort_orders object`,
        );
        continue;
      }
      const allTokenValuesSet: Set<string> = new Set();
      for (const part of splitAtTokens(goal.name)) {
        if (part.type === "plain") {
          continue;
        }
        for (const option of pasta.tokens?.[part.token] ?? []) {
          allTokenValuesSet.add(option);
        }
      }
      const allTokenValues = [...allTokenValuesSet];
      // do any $numeric sorts have non-numeric values?
      if (sortTokens === "$numeric") {
        const nanValues = allTokenValues.filter((v) => isNaN(Number(v)));
        if (nanValues.length > 0) {
          const nanPretty = nanValues.map((v) => `"${v}"`).join(", ");
          warnings.push(
            `⚠ Goal ${goal.name} has $numeric sort_tokens, but may include non-numeric token values: ${nanPretty}`,
          );
        }
      } else {
        // do any explicit sorts have missing values?
        const sortOrder =
          typeof sortTokens === "string"
            ? pasta.sort_orders![sortTokens]!
            : sortTokens;
        const missingValues = allTokenValues.filter((v) =>
          sortOrder.includes(v),
        );
        if (missingValues.length > 0) {
          const missingPretty = missingValues.map((v) => `"${v}"`).join(", ");
          warnings.push(
            `⚠ Goal ${goal.name} has token values missing in provided sort order: ${missingPretty}`,
          );
        }
      }
    }
    return errors.length > 0
      ? { pasta: null, errors, warnings }
      : { pasta, errors, warnings };
  } catch (err) {
    if (err instanceof Error) {
      return {
        pasta: null,
        errors: [
          `✖ ${err.message}.\nTry pasting your pasta into a general-purpose JSON linter, such as https://jsonlint.com/`,
        ],
        warnings: [],
      };
    } else {
      return {
        pasta: null,
        errors: ["✖ Unknown error occurred"],
        warnings: [],
      };
    }
  }
}
