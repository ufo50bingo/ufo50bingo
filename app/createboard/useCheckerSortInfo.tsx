import { useMemo } from "react";
import { UFODifficulties } from "../generator/ufoGenerator";
import { ORDERED_PROPER_GAMES } from "../goals";
import { CheckerSort } from "./CheckerSortSelector";
import getAllSubcategories from "./getAllSubcategories";

type Props = {
  ufoDifficulties: UFODifficulties;
  categories: ReadonlyArray<string>;
  sort: CheckerSort;
};

export default function useCheckerSortInfo({
  ufoDifficulties,
  categories,
  sort,
}: Props): [boolean, ReadonlyArray<string>] {
  const allSubcategories = useMemo(() => getAllSubcategories(ufoDifficulties, categories), [categories, ufoDifficulties]);
  const hasChronological = useMemo(() => {
    return allSubcategories.isSubsetOf(new Set(ORDERED_PROPER_GAMES));
  }, [allSubcategories]);
  const sortedSubcategories = useMemo(() => {
    if (hasChronological && sort === "chronological") {
      return ORDERED_PROPER_GAMES.filter((game) => allSubcategories.has(game));
    }
    const subcatArray = [...allSubcategories];
    subcatArray.sort();
    return subcatArray;
  }, [allSubcategories, hasChronological, sort]);
  return [hasChronological, sortedSubcategories];
}
