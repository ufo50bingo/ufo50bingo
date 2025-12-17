import zod from "zod";
import { UFOPasta } from "./ufoGenerator";

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

export default function validateUfo(json: string): UFOPasta {
  const parsed = JSON.parse(json);
  const validated = UfoPasta.parse(parsed);
  return validated;
}
