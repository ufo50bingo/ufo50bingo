import { Checkbox, Group, SimpleGrid, Text } from "@mantine/core";
import { BingosyncColor } from "../matches/parseBingosyncData";
import getColorHex from "../room/[id]/cast/getColorHex";
import CheckerSortSelector, { CheckerSort } from "./CheckerSortSelector";
import { UFOPasta } from "../generator/ufoGenerator";
import getSubcategoryName from "../generator/getSubcategoryName";
import useCheckerSortInfo from "./useCheckerSortInfo";

const COLORS: ReadonlyArray<BingosyncColor> = [
  "red",
  "blue",
  "green",
  "yellow",
  "pink",
];

type Props = {
  numPlayers: number;
  pasta: UFOPasta;
  draftCategories: ReadonlyArray<string>;
  draftCheckState: Map<string, number>;
  setDraftCheckState: (newCheckState: Map<string, number>) => void;
  sort: CheckerSort;
  setSort: (newSort: CheckerSort) => unknown;
};

export default function DraftChecker({
  draftCategories,
  draftCheckState,
  setDraftCheckState,
  numPlayers,
  pasta,
  sort,
  setSort,
}: Props) {
  const [hasChronological, sortedSubcategories] = useCheckerSortInfo({ ufoDifficulties: pasta.goals, categories: draftCategories, sort });
  return (
    <>
      <Group>
        <Text>
          <strong>Select drafted games for each player</strong>
        </Text>
        {hasChronological && (
          <CheckerSortSelector sort={sort} setSort={setSort} />
        )}
      </Group>
      <SimpleGrid cols={3}>
        {sortedSubcategories.map((game) => (
          <Group key={game}>
            {Array(numPlayers)
              .fill(null)
              .map((_, playerIndex) => (
                <Checkbox
                  key={playerIndex}
                  color={getColorHex(COLORS[playerIndex])}
                  checked={draftCheckState.get(game) === playerIndex}
                  onChange={(event) => {
                    const newState = new Map(draftCheckState);
                    if (event.currentTarget.checked) {
                      newState.set(game, playerIndex);
                    } else {
                      newState.delete(game);
                    }
                    setDraftCheckState(newState);
                  }}
                />
              ))}
            <Text size="sm">{getSubcategoryName(game)}</Text>
          </Group>
        ))}
      </SimpleGrid>
    </>
  );
}
