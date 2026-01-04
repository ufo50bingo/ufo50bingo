import { Checkbox, SimpleGrid, Text } from "@mantine/core";
import { Game, GAME_NAMES } from "../goals";

type Props = {
  checkState: Map<Game, boolean>;
  setCheckState: (newCheckState: Map<Game, boolean>) => void;
};

export default function GameChecker({ checkState, setCheckState }: Props) {
  const isAllChecked = checkState.values().every((isChecked) => isChecked);
  const isNoneChecked = checkState.values().every((isChecked) => !isChecked);
  const [sortType, setSortTypeRaw] = useState<"chronological" | "alphabetical">(
    () => {
      if (global.window == undefined || localStorage == null) {
        return "fast";
      }
      const fromStorage = localStorage.getItem("sort_type");
      if (fromStorage == null || fromStorage === "") {
        return "fast";
      }
      switch (fromStorage) {
        case "fast":
          return "fast";
        case "alphabetical":
          return "alphabetical";
        case "chronological":
          return "chronological";
        default:
          return "fast";
      }
    }
  );

  const setSortType = (newSortType: SortType) => {
    setSortTypeRaw(newSortType);
    if (global.window == undefined || localStorage == null) {
      return;
    }
    localStorage.setItem("sort_type", newSortType);
  };
  return (
    <>
      <Text>
        <strong>Select included games</strong>
      </Text>
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
