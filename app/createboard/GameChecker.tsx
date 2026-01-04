import { Checkbox, Group, SimpleGrid, Text } from "@mantine/core";
import { Game, GAME_NAMES } from "../goals";
import CheckerSortSelector, { CheckerSort } from "./CheckerSortSelector";

type Props = {
  checkState: Map<Game, boolean>;
  setCheckState: (newCheckState: Map<Game, boolean>) => void;
  sort: CheckerSort,
  setSort: (newSort: CheckerSort) => unknown;
};

export default function GameChecker({ checkState, setCheckState, sort, setSort }: Props) {
  const isAllChecked = checkState.values().every((isChecked) => isChecked);
  const isNoneChecked = checkState.values().every((isChecked) => !isChecked);
  return (
    <>
      <Group>
        <Text>
          <strong>Select included games</strong>
        </Text>
        <CheckerSortSelector sort={sort} setSort={setSort} />
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
              checkState.keys().map((key) => [key, !isAllChecked])
            );
            setCheckState(newState);
          }}
        />
        {Array.from(
          checkState.entries().map(([key, isChecked]) => (
            <Checkbox
              key={key}
              label={GAME_NAMES[key]}
              checked={isChecked}
              onChange={(event) => {
                const newState = new Map(checkState);
                newState.set(key, event.currentTarget.checked);
                setCheckState(newState);
              }}
            />
          ))
        )}
      </SimpleGrid>
    </>
  );
}
