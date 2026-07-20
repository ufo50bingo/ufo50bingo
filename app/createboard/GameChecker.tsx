import { Checkbox, Group, SimpleGrid, Text } from "@mantine/core";
import CheckerSortSelector, { CheckerSort } from "./CheckerSortSelector";
import useCheckerSortInfo from "./useCheckerSortInfo";
import { UFOPasta } from "../generator/ufoGenerator";
import getSubcategoryName from "../generator/getSubcategoryName";
import getNonGeneralCategories from "./getNonGeneralCategories";

type Props = {
  pasta: UFOPasta;
  uncheckedGames: Set<string>;
  setUncheckedGames: (newUncheckedGames: Set<string>) => void;
  sort: CheckerSort;
  setSort: (newSort: CheckerSort) => unknown;
};

export default function GameChecker({
  pasta,
  uncheckedGames,
  setUncheckedGames,
  sort,
  setSort,
}: Props) {
  const [hasChronological, sortedSubcategories] = useCheckerSortInfo({
    ufoDifficulties: pasta.goals,
    categories: getNonGeneralCategories(pasta),
    sort,
  });

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
        {hasChronological && (
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
