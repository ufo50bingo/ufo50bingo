import { useMemo } from "react";
import { UFODifficulties, UFOGameGoals, UFOPasta } from "../generator/ufoGenerator";
import { ORDERED_PROPER_GAMES } from "../goals";
import { CheckerSort } from "./CheckerSortSelector";

type Props = {
    ufoDifficulties: UFODifficulties;
    categories: ReadonlyArray<string>;
    sort: CheckerSort;
}

export default function useCheckerSortInfo({ ufoDifficulties, categories, sort }: Props): [boolean, ReadonlyArray<string>] {
    const allSubcategories = useMemo(() => {
        const subcategories: Set<string> = new Set();
        for (const category of categories) {
            for (const subcategory of Object.keys(ufoDifficulties[category])) {
                subcategories.add(subcategory);
            }
        }
        return subcategories;
    }, [categories, ufoDifficulties]);
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