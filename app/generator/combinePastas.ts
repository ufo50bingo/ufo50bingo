import addPrefixToPasta from "./addPrefixToPasta";
import { UFOPasta } from "./ufoGenerator";

type Input = {
  pasta: UFOPasta;
  prefix: string;
};

export default function combinePastas(inputs: ReadonlyArray<Input>): UFOPasta {
  const prefixed = inputs.map(({ pasta, prefix }) =>
    addPrefixToPasta(pasta, prefix),
  );
  const combined: UFOPasta = {
    goals: Object.assign({}, ...prefixed.map((p) => p.goals)),
    tokens: Object.assign({}, ...prefixed.map((p) => p.tokens)),
    restriction_option_lists: Object.assign(
      {},
      ...prefixed.map((p) => p.restriction_option_lists ?? {}),
    ),
    sort_orders: Object.assign({}, ...prefixed.map((p) => p.sort_orders ?? {})),
    category_counts: prefixed[0].category_counts,
    draft: prefixed[0].draft,
  };
  return combined;
}
