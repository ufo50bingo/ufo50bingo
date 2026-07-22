import { ORDERED_PROPER_GAMES, ProperGame } from "@/app/goals";
import { Anchor, Button, Checkbox, Group, Stack } from "@mantine/core";
import { findGamesForGoal, GameToGoals } from "./findAllGames";
import InfoCard from "./InfoCard";
import GameInfo from "./GameInfo";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import getColorHex from "./getColorHex";
import BingosyncColored from "@/app/matches/BingosyncColored";
import { CountChange, CountState } from "./useSyncedState";
import { SortType } from "./useLocalState";
import {
  Descriptions,
  OptionList,
  OptionListEntry,
  UFOPasta,
} from "@/app/generator/ufoGenerator";
import { useMemo } from "react";
import { FoundStandardGeneral } from "./Cast";
import {
  CHERRIES,
  GIFTS,
  GIFT_DESCRIPTIONS,
  GOLDS,
  TWO_LEVELS,
  FOUR_LEVELS,
  EIGHT_LEVELS,
  TWO_BOSSES,
  BOSSES,
} from "./timeEstimates";

type Props = {
  showAll: boolean;
  isFinished: boolean;
  gameToGoals: GameToGoals;
  foundGoal: FoundStandardGeneral;
  terminalCodes: Set<string>;
  countState: null | undefined | CountState;
  setGeneralGameCount: (change: CountChange) => unknown;
  addShowAll: (goal: string) => unknown;
  leftColor: BingosyncColor;
  rightColor: BingosyncColor;
  height: null | undefined | number;
  sortType: SortType;
  pasta: UFOPasta;
};

function getOtherGoals(
  entry: OptionListEntry,
  gameToGoals: GameToGoals,
  resolvedGoal: string,
): null | ReadonlyArray<[string, number]> {
  const game = typeof entry === "string" ? entry : entry.option;
  const goals = gameToGoals[game];
  if (goals == null || goals.length === 0) {
    return null;
  }
  const otherGoals = goals.filter((g) => g[0] !== resolvedGoal);
  return otherGoals.length === 0 ? null : otherGoals;
}

export default function GeneralGoal({
  showAll,
  gameToGoals,
  foundGoal,
  isFinished,
  terminalCodes,
  countState,
  setGeneralGameCount,
  addShowAll,
  leftColor,
  rightColor,
  height,
  sortType,
  pasta: _pasta,
}: Props) {
  const leftCounts = countState?.leftCounts ?? {};
  const rightCounts = countState?.rightCounts ?? {};
  const cast = foundGoal.cast;

  const descriptions: null | Descriptions = useMemo(() => {
    const rawDescriptions = cast.descriptions;
    if (rawDescriptions == null) {
      return null;
    } else if (typeof rawDescriptions === "string") {
      if (rawDescriptions === "$gift_desc") {
        return GIFT_DESCRIPTIONS;
      }
      return null;
    } else {
      return rawDescriptions;
    }
  }, [cast.descriptions]);

  const options: OptionList = useMemo(() => {
    const options = cast.options;
    if (typeof options === "string") {
      switch (options) {
        case "$gift":
          return GIFTS;
        case "$gold":
          return GOLDS;
        case "$cherry":
          return CHERRIES;
        case "$two_levels":
          return TWO_LEVELS;
        case "$four_levels":
          return FOUR_LEVELS;
        case "$eight_levels":
          return EIGHT_LEVELS;
        case "$two_bosses":
          return TWO_BOSSES;
        case "$bosses":
          return BOSSES;
        case "$infer":
          return {
            shown: findGamesForGoal(foundGoal.resolvedGoal),
            shown_if_on_card: [],
            hidden: [],
          };
        default:
          return { shown: [], shown_if_on_card: [], hidden: [] };
      }
    } else {
      return options;
    }
  }, [cast.options, foundGoal.resolvedGoal]);

  const titleEl = (
    <>
      {foundGoal.resolvedGoal} (
      <BingosyncColored color={leftColor}>
        {Object.keys(leftCounts).reduce(
          (acc, game) => acc + leftCounts[game],
          0,
        )}
      </BingosyncColored>{" "}
      <BingosyncColored color={rightColor}>
        {Object.keys(rightCounts).reduce(
          (acc, game) => acc + rightCounts[game],
          0,
        )}
      </BingosyncColored>
      )
    </>
  );
  const title = isFinished ? <s>{titleEl}</s> : titleEl;

  const alwaysWithOnCard: ReadonlyArray<
    [OptionListEntry, null | ReadonlyArray<[string, number]>]
  > = options.shown.map((e) => [
    e,
    getOtherGoals(e, gameToGoals, foundGoal.resolvedGoal),
  ]);
  const synergyWithOnCard: ReadonlyArray<
    [OptionListEntry, null | ReadonlyArray<[string, number]>]
  > = options.shown_if_on_card.map((e) => [
    e,
    getOtherGoals(e, gameToGoals, foundGoal.resolvedGoal),
  ]);
  const neverWithOnCard: ReadonlyArray<
    [OptionListEntry, null | ReadonlyArray<[string, number]>]
  > = options.hidden.map((e) => [
    e,
    getOtherGoals(e, gameToGoals, foundGoal.resolvedGoal),
  ]);

  const allEntries = [
    ...alwaysWithOnCard,
    ...synergyWithOnCard,
    ...neverWithOnCard,
  ];
  const entries = showAll
    ? allEntries
    : [...alwaysWithOnCard, ...synergyWithOnCard.filter((e) => e[1])];

  const hasMore = allEntries.length > entries.length;

  const nullableEntries: ReadonlyArray<
    null | [string, null | ReadonlyArray<[string, number]>]
  > = entries.map((pair) => {
    const e = pair[0];
    if (typeof e === "string") {
      return [e, pair[1]];
    }
    return terminalCodes.has(e.has_extra) === (e.type === "include")
      ? [e.option, pair[1]]
      : null;
  });

  const nonNullEntries = nullableEntries.filter((e) => e != null);
  const finalEntries = cast.on_card_only
    ? nonNullEntries.filter((e) => e[1] != null)
    : nonNullEntries;

  const isUfo50 = allEntries.every((entry) =>
    ORDERED_PROPER_GAMES.includes(entry[0] as ProperGame),
  );
  if (sortType === "chronological" && isUfo50) {
    finalEntries.sort(
      (a, b) =>
        ORDERED_PROPER_GAMES.indexOf(a[0] as ProperGame) -
        ORDERED_PROPER_GAMES.indexOf(b[0] as ProperGame),
    );
  } else if (
    sortType === "alphabetical" ||
    (sortType === "chronological" && !isUfo50)
  ) {
    finalEntries.sort((a, b) => a[0].localeCompare(b[0]));
  } else {
    // no sorting for fast
  }

  return (
    <InfoCard
      height={height}
      title={title}
      description={
        cast.type === "check"
          ? undefined
          : "Left click increases, right click decreases"
      }
    >
      <Stack gap={4}>
        {finalEntries.map((e) => {
          const [game, otherGoals] = e;
          const description = descriptions != null ? descriptions[game] : null;
          return (
            <Group key={game} gap={6}>
              {cast.type === "check" ? (
                <>
                  <Checkbox
                    color={getColorHex(leftColor)}
                    checked={(leftCounts[game] ?? 0) > 0}
                    onChange={(event) =>
                      setGeneralGameCount({
                        goal: foundGoal.resolvedGoal,
                        is_left: true,
                        game,
                        count: event.currentTarget.checked ? 1 : 0,
                      })
                    }
                  />
                  <Checkbox
                    color={getColorHex(rightColor)}
                    checked={(rightCounts[game] ?? 0) > 0}
                    onChange={(event) =>
                      setGeneralGameCount({
                        goal: foundGoal.resolvedGoal,
                        is_left: false,
                        game,
                        count: event.currentTarget.checked ? 1 : 0,
                      })
                    }
                  />
                </>
              ) : (
                <>
                  <Button
                    color={getColorHex(leftColor)}
                    h={18}
                    w={18}
                    p={0}
                    size="compact-xs"
                    onClick={() => {
                      setGeneralGameCount({
                        goal: foundGoal.resolvedGoal,
                        is_left: true,
                        game,
                        count: (leftCounts[game] ?? 0) + 1,
                      });
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setGeneralGameCount({
                        goal: foundGoal.resolvedGoal,
                        is_left: true,
                        game,
                        count: Math.max(0, (leftCounts[game] ?? 0) - 1),
                      });
                    }}
                  >
                    {leftCounts[game] ?? 0}
                  </Button>
                  <Button
                    color={getColorHex(rightColor)}
                    h={18}
                    w={18}
                    p={0}
                    size="compact-xs"
                    onClick={() => {
                      setGeneralGameCount({
                        goal: foundGoal.resolvedGoal,
                        is_left: false,
                        game,
                        count: (rightCounts[game] ?? 0) + 1,
                      });
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setGeneralGameCount({
                        goal: foundGoal.resolvedGoal,
                        is_left: false,
                        game,
                        count: Math.max(0, (rightCounts[game] ?? 0) - 1),
                      });
                    }}
                  >
                    {rightCounts[game] ?? 0}
                  </Button>
                </>
              )}

              <GameInfo
                game={game}
                goals={otherGoals}
                description={description}
              />
            </Group>
          );
        })}
        {hasMore ? (
          <Anchor onClick={() => addShowAll(foundGoal.resolvedGoal)} size="sm">
            Show all options
          </Anchor>
        ) : null}
      </Stack>
    </InfoCard>
  );
}
