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
  category_counts: {
    "Std Easy": 3,
    "Std Medium": 3,
    "Std Hard": 3,
    "Std Very Hard": 3,
    "Spc Easy": 2,
    "Spc Medium": 2,
    "Spc Hard": 2,
    "Spc Very Hard": 2,
    "Std General": 5,
    "Spc General": 0,
  },
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
