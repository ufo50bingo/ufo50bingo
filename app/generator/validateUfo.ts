import zod from "zod";
import { UFOPasta } from "./ufoGenerator";
import findAllTokens from "./findAllTokens";

type Return = {
  pasta: UFOPasta | null,
  errors: ReadonlyArray<string>,
  warnings: ReadonlyArray<string>,
};

const UfoPasta = zod.strictObject({
  goals: zod.record(
    zod.string(),
    zod.record(zod.string(), zod.array(zod.string()))
  ),
  tokens: zod.record(zod.string(), zod.array(zod.string())),
  category_counts: zod.record(zod.string(), zod.int()),
  categories_with_global_group_repeat_prevention: zod
    .array(zod.string())
    .optional(),
  category_difficulty_tiers: zod.array(zod.array(zod.string())).optional(),
});

export default function validateUfo(json: string): Return {
  try {
    const parsed = JSON.parse(json);
    const pasta = UfoPasta.parse(parsed);
    const warnings: Array<string> = [];
    const errors: Array<string> = [];

    const maxTokenCounts = findAllTokens(pasta.goals);
    // are all used tokens defined properly?
    Object.keys(maxTokenCounts).forEach(token => {
      const maxCount = maxTokenCounts[token];
      const options = pasta.tokens[token];
      if (options == null) {
        errors.push(`✖ Token "${token}" appears in a goal but does not have options specified in the "tokens" object.`);
      } else if (options.length < maxCount) {
        const allOptions = options.map(option => `"${option}"`).join(", ");
        errors.push(`✖ Token "${token}" appears in a goal ${maxCount} times, but only has ${options.length} options in its definition in the "tokens" object [${allOptions}]`);
      }
    });
    // are there any unused tokens?
    Object.keys(pasta.tokens).forEach(token => {
      if (maxTokenCounts[token] == null) {
        warnings.push(`⚠ Token "${token}" is defined in the "tokens" object but is not used in any goals`);
      }
    });
    // do categories add up propery?
    const categorySum = Object.values(pasta.category_counts).reduce((acc, count) => acc + count);
    if (categorySum !== 25) {
      errors.push(`✖ category_counts sum must be 25, but got ${categorySum}`);
    }
    // are all categories actually in the goals list?
    Object.keys(pasta.category_counts).forEach(category => {
      const count = pasta.category_counts[category];
      if (count === 0) {
        return;
      }
      const goals = pasta.goals[category];
      if (goals == null) {
        errors.push(`✖ Category "${category}" has count ${count} but does not appear in the "goals" object`);
        return;
      }
      const numGoals = Object.values(goals).reduce((acc, goalList) => acc + goalList.length, 0);
      if (numGoals < count) {
        errors.push(`✖ Category "${category}" has count ${count} but only has ${numGoals} goals in the "goals" object`);
      }
    });
    // are any categories missing from category_counts?
    Object.keys(pasta.goals).forEach(category => {
      if (pasta.category_counts[category] == null) {
        warnings.push(`⚠ Category "${category}" appears in the "goals" object but not in the "category_counts" object`);
      }
    });
    // are any categories present in category_difficulty_tiers but not category_counts?
    (pasta.category_difficulty_tiers ?? []).forEach(tier => {
      tier.forEach(category => {
        if (pasta.category_counts[category] == null) {
          warnings.push(`⚠ Category "${category}" appears in the "category_difficulty_tiers" object but not the "category_counts" object`);
        }
      });
    });
    // are any categories present in categories_with_global_group_repeat_prevention but not category_counts?
    (pasta.categories_with_global_group_repeat_prevention ?? []).forEach(category => {
      if (pasta.category_counts[category] == null) {
        warnings.push(`⚠ Category "${category}" appears in the "categories_with_global_group_repeat_prevention" object but not the "category_counts" object`);
      }
    });
    return errors.length > 0
      ? { pasta: null, errors, warnings }
      : { pasta, errors, warnings };
  } catch (err) {
    if (err instanceof zod.ZodError) {
      return { pasta: null, errors: [zod.prettifyError(err)], warnings: [] };
    } else if (err instanceof Error) {
      return { pasta: null, errors: [err.message], warnings: [] };
    } else {
      return { pasta: null, errors: ['Unknown error occurred'], warnings: [] };
    }
  }
}
