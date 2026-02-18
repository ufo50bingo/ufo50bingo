import { Checkbox, Group, SimpleGrid, Text } from "@mantine/core";
import { Game, GAME_NAMES } from "../goals";
import { BingosyncColor } from "../matches/parseBingosyncData";
import getColorHex from "../room/[id]/cast/getColorHex";
import CheckerSortSelector, { CheckerSort } from "./CheckerSortSelector";
import { UFOPasta } from "../generator/ufoGenerator";
import { useMemo } from "react";

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
  const sortedCategories = useMemo(() => {
    const subcategories: Set<string> = new Set();
    for (const category of draftCategories) {
      for (const subcategory of Object.keys(pasta.goals[category])) {
        subcategories.add(subcategory);
      }
    }
    return sort === "chronological" ? subcategories : subcategories.toSorted();
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
        {Array.from(
          draftCheckState.entries().map(([game, checkedPlayer]) => (
            <Group key={game}>
              {Array(numPlayers)
                .fill(null)
                .map((_, playerIndex) => (
                  <Checkbox
                    key={playerIndex}
                    color={getColorHex(COLORS[playerIndex])}
                    checked={checkedPlayer === playerIndex}
                    onChange={(event) => {
                      const newState = new Map(draftCheckState);
                      newState.set(
                        game,
                        event.currentTarget.checked ? playerIndex : null,
                      );
                      setDraftCheckState(newState);
                    }}
                  />
                ))}
              <Text size="sm">{GAME_NAMES[game]}</Text>
            </Group>
          )),
        )}
      </SimpleGrid>
    </>
  );
}
