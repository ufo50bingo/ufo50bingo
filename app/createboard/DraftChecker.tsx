import { Checkbox, Group, SimpleGrid, Text } from "@mantine/core";
import { Game, GAME_NAMES } from "../goals";
import { BingosyncColor } from "../matches/parseBingosyncData";
import getColorHex from "../room/[id]/cast/getColorHex";
import CheckerSortSelector, { CheckerSort } from "./CheckerSortSelector";
import { UFOPasta } from "../generator/ufoGenerator";
import { useMemo } from "react";
import getSubcategoryName from "../generator/getSubcategoryName";

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
  const sortedSubcategories = useMemo(() => {
    const subcategories: Set<string> = new Set();
    for (const category of draftCategories) {
      for (const subcategory of Object.keys(pasta.goals[category])) {
        subcategories.add(subcategory);
      }
    }
    const subcatArray = [...subcategories];
    if (sort !== "chronological") {
      subcatArray.sort();
    }
    return subcatArray;
  }, [draftCategories, pasta.goals, sort]);

  return (
    <>
      <Group>
        <Text>
          <strong>Select drafted games for each player</strong>
        </Text>
        <CheckerSortSelector sort={sort} setSort={setSort} />
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
                      newState.set(
                        game,
                        playerIndex,
                      );
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
