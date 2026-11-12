import { inferGames } from "../generator/inferGames";
import { UFOPasta } from "../generator/ufoGenerator";
import getPresetOptionList from "../room/[id]/cast/getPresetOptionList";

export default function getAllCastOptions(pasta: UFOPasta): Set<string> {
  const allCastOptions: Set<string> = new Set();
  for (const category of Object.keys(pasta.goals)) {
    for (const subcategory of Object.keys(pasta.goals[category])) {
      for (const goal of pasta.goals[category][subcategory]) {
        if (typeof goal === "object" && goal.cast != null) {
          const optionsRaw = goal.cast.options;
          const optionsList = typeof optionsRaw === "string"
            // $infer options are already included as subcategories, so we don't need them
            ? getPresetOptionList(optionsRaw, [])
            : optionsRaw
          const options = [...optionsList.shown, ...optionsList.shown_if_on_card, ...optionsList.hidden];
          for (const option of options) {
            if (typeof option === "string") {
              allCastOptions.add(option);
            } else {
              allCastOptions.add(option.option);
            }
          }
        }
      }
    }
  }
  return allCastOptions;
}