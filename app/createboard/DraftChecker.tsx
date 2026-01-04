import { Checkbox, Group, SimpleGrid, Text } from "@mantine/core";
import { Game, GAME_NAMES } from "../goals";
import { BingosyncColor } from "../matches/parseBingosyncData";
import getColorHex from "../room/[id]/cast/getColorHex";
import CheckerSortSelector, { CheckerSort } from "./CheckerSortSelector";

const COLORS: ReadonlyArray<BingosyncColor> = [
  "red",
  "blue",
  "green",
  "yellow",
  "pink",
];

type Props = {
  numPlayers: number;
  draftCheckState: Map<Game, null | number>;
  setDraftCheckState: (newCheckState: Map<Game, null | number>) => void;
  sort: CheckerSort;
  setSort: (newSort: CheckerSort) => unknown;
};

export default function DraftChecker({
  draftCheckState,
  setDraftCheckState,
  numPlayers,
  sort,
  setSort,
}: Props) {
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
                        event.currentTarget.checked ? playerIndex : null
                      );
                      setDraftCheckState(newState);
                    }}
                  />
                ))}
              <Text size="sm">{GAME_NAMES[game]}</Text>
            </Group>
          ))
        )}
      </SimpleGrid>
    </>
  );
}
