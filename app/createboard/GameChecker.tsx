import { Checkbox, Group, SimpleGrid, Text } from "@mantine/core";
import { Game, ProperGame } from "../goals";
import CheckerSortSelector, { CheckerSort } from "./CheckerSortSelector";
import useCheckerSortInfo from "./useCheckerSortInfo";
import { UFODifficulties } from "../generator/ufoGenerator";
import getSubcategoryName from "../generator/getSubcategoryName";

type Props = {
  ufoDifficulties: UFODifficulties;
  checkState: Map<Game, boolean>;
  setCheckState: (newCheckState: Map<Game, boolean>) => void;
  sort: CheckerSort;
  setSort: (newSort: CheckerSort) => unknown;
};

export default function GameChecker({
  ufoDifficulties,
  checkState,
  setCheckState,
  sort,
  setSort,
}: Props) {
  const isAllChecked = checkState.values().every((isChecked) => isChecked);
  const isNoneChecked = checkState.values().every((isChecked) => !isChecked);

  const [hasChronological, sortedSubcategories] = useCheckerSortInfo({
    ufoDifficulties,
    categories: Object.keys(ufoDifficulties).filter((cat) => cat !== "general"),
    sort,
  });
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
            const newState = new Map(
              checkState.keys().map((key) => [key, !isAllChecked]),
            );
            setCheckState(newState);
          }}
        />
        {sortedSubcategories.map((subcategory) => (
          <Checkbox
            key={subcategory}
            label={getSubcategoryName(subcategory)}
            checked={checkState.get(subcategory as ProperGame) !== false}
            onChange={(event) => {
              const newState = new Map(checkState);
              newState.set(
                subcategory as ProperGame,
                event.currentTarget.checked,
              );
              setCheckState(newState);
            }}
          />
        ))}
      </SimpleGrid>
    </>
  );
}
