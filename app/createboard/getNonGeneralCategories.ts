import { UFOPasta } from "../generator/ufoGenerator";

export default function getNonGeneralCategories(
  pasta: UFOPasta,
): ReadonlyArray<string> {
  const generalCategories =
    pasta.general_categories != null ? pasta.general_categories : ["general"];
  return Object.keys(pasta.goals).filter(
    (cat) => !generalCategories.includes(cat),
  );
}
