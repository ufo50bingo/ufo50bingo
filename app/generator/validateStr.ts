import zod from "zod";
import { UFOPasta } from "./ufoGenerator";
import validateUfo from "./validateUfo";

export type Return = {
  pasta: UFOPasta | null;
  errors: ReadonlyArray<string>;
  warnings: ReadonlyArray<string>;
};

const getOptionList = () => zod.array(zod.union([
  zod.string(),
  zod.strictObject({
    type: zod.enum(["include", "exclude"]),
    has_extra: zod.string(),
    option: zod.string(),
  }),
]));

const UfoPasta = zod.strictObject({
  goals: zod.record(
    zod.string(),
    zod.record(
      zod.string(),
      zod.array(
        zod.union([
          zod.string(),
          zod.strictObject({
            name: zod.string(),
            restriction: zod
              .strictObject({
                count: zod.number(),
                fallback: zod.string(),
                options: zod.union([zod.string(), zod.array(zod.string())]),
              })
              .optional(),
            sort_tokens: zod
              .union([zod.string(), zod.array(zod.string())])
              .optional(),
            short: zod.string().optional(),
            cast: zod.strictObject({
              type: zod.enum(["check", "counter"]),
              options: zod.union([
                zod.string(),
                zod.strictObject({
                  shown: getOptionList(),
                  shown_if_on_card: getOptionList(),
                  hidden: getOptionList(),
                }),
              ]),
              on_card_only: zod.boolean(),
              image: zod.strictObject({
                src: zod.string(),
                is_pixel: zod.boolean(),
              }).optional(),
              descriptions: zod.union([
                zod.string(),
                zod.record(zod.string(), zod.string()),
              ]).optional(),
            }).optional(),
          }),
        ]),
      ),
    ),
  ),
  tokens: zod.record(zod.string(), zod.array(zod.string())),
  category_counts: zod.record(zod.string(), zod.int()),
  general_categories: zod.array(zod.string()).optional(),
  category_difficulty_tiers: zod.array(zod.array(zod.string())).optional(),
  restriction_option_lists: zod
    .record(zod.string(), zod.array(zod.string()))
    .optional(),
  sort_orders: zod.record(zod.string(), zod.array(zod.string())).optional(),
  draft: zod
    .strictObject({
      excluded_categories: zod.array(zod.string()),
      category_counts: zod.array(zod.record(zod.string(), zod.number())),
    })
    .optional(),
});

export default function validateStr(json: string): Return {
  try {
    const parsed = JSON.parse(json);
    const pasta = UfoPasta.parse(parsed);
    return validateUfo(pasta);
  } catch (err) {
    if (err instanceof zod.ZodError) {
      return { pasta: null, errors: [zod.prettifyError(err)], warnings: [] };
    } else if (err instanceof Error) {
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
