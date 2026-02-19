import combinePastas from "../generator/combinePastas";
import { UFODraftPasta } from "../generator/ufoGenerator";
import { SPICY_UFO } from "./spicyUfo";
import { STANDARD_UFO } from "./standardUfo";

const COMBINED = combinePastas([
  { pasta: STANDARD_UFO, prefix: "Std" },
  { pasta: SPICY_UFO, prefix: "Spc" },
]);

export const COMBO_UFO: UFODraftPasta = {
  ...COMBINED,
  draft: {
    excluded_categories: ["Std General", "Spc General"],
    category_counts: [
      {
        "Std Easy": 3,
        "Std Medium": 2,
        "Std Hard": 2,
        "Std Very Hard": 2,
        "Spc Easy": 1,
        "Spc Medium": 1,
        "Spc Hard": 1,
        "Spc Very Hard": 1,
      },
      {
        "Std Easy": 2,
        "Std Medium": 2,
        "Std Hard": 2,
        "Std Very Hard": 2,
        "Spc Easy": 1,
        "Spc Medium": 1,
        "Spc Hard": 1,
        "Spc Very Hard": 1,
      },
    ],
  },
};
