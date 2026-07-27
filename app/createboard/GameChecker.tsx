import { Checkbox, Group, SimpleGrid, Text } from "@mantine/core";
import CheckerSortSelector, { CheckerSort } from "./CheckerSortSelector";
import useCheckerSortInfo from "./useCheckerSortInfo";
import { UFOPasta } from "../generator/ufoGenerator";
import getSubcategoryName from "../generator/getSubcategoryName";
import getNonGeneralCategories from "./getNonGeneralCategories";
import { useMemo } from "react";

type Props = {
  pasta: UFOPasta;
  uncheckedGames: Set<string>;
  setUncheckedGames: (newUncheckedGames: Set<string>) => void;
  sort: CheckerSort;
  setSort: (newSort: CheckerSort) => unknown;
  canSort: boolean;
  excludedGames?: ReadonlySet<string>;
};

export default function GameChecker({
  pasta,
  uncheckedGames,
  setUncheckedGames,
  sort,
  setSort,
  canSort,
  excludedGames,
}: Props) {
  const [hasChronological, rawSortedSubcategories] = useCheckerSortInfo({
    ufoDifficulties: pasta.goals,
    categories: getNonGeneralCategories(pasta),
    sort,
  });
  const sortedSubcategories = useMemo(
    () =>
      rawSortedSubcategories.filter(
        (sc) => excludedGames == null || !excludedGames.has(sc),
      ),
    [excludedGames, rawSortedSubcategories],
  );

  const isAllChecked = sortedSubcategories.every(
    (sc) => !uncheckedGames.has(sc),
  );
  const isNoneChecked = sortedSubcategories.every((sc) =>
    uncheckedGames.has(sc),
  );

  return (
    <>
      <Group>
        <Text>
          <strong>Select included games</strong>
        </Text>
        {canSort && hasChronological && (
          <CheckerSortSelector sort={sort} setSort={setSort} />
        )}
      </Group>
      <SimpleGrid cols={3}>
        <Checkbox
          label={
            <strong>
              <u>{isAllChecked ? "Deselect All" : "Select All"}</u>
            </strong>
          }
          indeterminate={!isAllChecked && !isNoneChecked}
          checked={isAllChecked}
          onChange={() => {
            const newState = isAllChecked
              ? uncheckedGames.union(new Set(sortedSubcategories))
              : uncheckedGames.difference(new Set(sortedSubcategories));
            setUncheckedGames(newState);
          }}
        />
        {sortedSubcategories.map((subcategory) => (
          <Checkbox
            key={subcategory}
            label={getSubcategoryName(subcategory)}
            checked={!uncheckedGames.has(subcategory)}
            onChange={(event) => {
              const newState = new Set(uncheckedGames);
              if (event.currentTarget.checked) {
                newState.delete(subcategory);
              } else {
                newState.add(subcategory);
              }
              setUncheckedGames(newState);
            }}
          />
        ))}
      </SimpleGrid>
    </>
  );
}
