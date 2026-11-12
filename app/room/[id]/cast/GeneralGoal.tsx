import { ORDERED_PROPER_GAMES, ProperGame } from "@/app/goals";
import { Anchor, Button, Checkbox, Group, Stack, Tooltip } from "@mantine/core";
import { GameToGoals } from "./findAllGames";
import InfoCard from "./InfoCard";
import GameInfo from "./GameInfo";
import getColorHex from "./getColorHex";
import BingosyncColored from "@/app/matches/BingosyncColored";
import { CountChange, CountState } from "./useSyncedState";
import {
  Descriptions,
  OptionList,
  OptionListEntry,
  UFOPasta,
} from "@/app/generator/ufoGenerator";
import React, { CSSProperties, useMemo } from "react";
import { FoundStandardGeneral } from "./Cast";
import { Restrictions, GeneralSettings } from "../play/GeneralSection";
import { PlayerMember } from "../common/useMembers";
import getPresetOptionList from "./getPresetOptionList";
import { GIFT_DESCRIPTIONS } from "./timeEstimates";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";

type Props = {
  showAll: boolean;
  isFinished: boolean;
  gameToGoals: GameToGoals;
  foundGoal: FoundStandardGeneral;
  terminalCodes: Set<string>;
  countState: null | undefined | CountState;
  setGeneralGameCount: null | ((change: CountChange) => unknown);
  addShowAll: (goal: string) => unknown;
  generalTrackerPlayers: ReadonlyArray<PlayerMember>;
  pasta: UFOPasta;
  restrictions: Restrictions;
  settings: GeneralSettings;
  isPlay: boolean;
  style?: CSSProperties;
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
  terminalCodes: rawTerminalCodes,
  countState,
  setGeneralGameCount,
  addShowAll,
  generalTrackerPlayers,
  pasta: _pasta,
  restrictions,
  settings,
  isPlay,
  style = {},
}: Props) {
  const terminalCodes = restrictions.canUseTerminalCodes
    ? rawTerminalCodes
    : new Set();
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
      return getPresetOptionList(options, foundGoal.inferredGames);
    } else {
      return options;
    }
  }, [cast.options, foundGoal.inferredGames]);

  const titleEl = (
    <>
      {foundGoal.resolvedGoal} (
      {generalTrackerPlayers.map(({ userId, color }, index) => {
        const counts = countState?.[userId];
        return (
          <React.Fragment key={userId}>
            {index > 0 ? " " : ""}
            <BingosyncColored color={color}>
              {counts == null
                ? 0
                : Object.entries(counts).reduce(
                    (acc, [_subcategory, count]) => acc + count,
                    0,
                  )}
            </BingosyncColored>
          </React.Fragment>
        );
      })}
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
  const entries =
    showAll || !settings.shouldSegment
      ? allEntries
      : [
          ...alwaysWithOnCard,
          ...synergyWithOnCard.filter(
            (e) => e[1] != null || !restrictions.canFilterOnCard,
          ),
        ];

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
  const finalEntries =
    cast.on_card_only && restrictions.canFilterOnCard
      ? nonNullEntries.filter((e) => e[1] != null)
      : nonNullEntries;

  const isUfo50 = allEntries.every((entry) =>
    ORDERED_PROPER_GAMES.includes(entry[0] as ProperGame),
  );
  if (settings.sort === "chronological" && isUfo50) {
    finalEntries.sort(
      (a, b) =>
        ORDERED_PROPER_GAMES.indexOf(a[0] as ProperGame) -
        ORDERED_PROPER_GAMES.indexOf(b[0] as ProperGame),
    );
  } else if (
    settings.sort === "alphabetical" ||
    (settings.sort === "chronological" && !isUfo50)
  ) {
    finalEntries.sort((a, b) => a[0].localeCompare(b[0]));
  } else {
    // no sorting for fast
  }

  return (
    <InfoCard
      style={style}
      title={title}
      description={
        cast.type === "check" || setGeneralGameCount == null
          ? undefined
          : "Left click increases, right click decreases"
      }
    >
      <Stack gap={4}>
        {finalEntries.map((e) => {
          const [game, otherGoals] = e;
          const description = descriptions != null ? descriptions[game] : null;
          const label = (
            <GameInfo
              game={game}
              goals={otherGoals}
              description={description}
              canShowTooltip={restrictions.canShowOnCardTooltips}
            />
          );
          const getCheckbox = (
            userId: number,
            color: BingosyncColor,
            name: string,
            gameCount: number,
            isPlay: boolean,
          ) => (
            <Checkbox
              key={isPlay ? game : undefined}
              color={getColorHex(color)}
              checked={gameCount > 0}
              readOnly={setGeneralGameCount == null}
              onChange={(event) => {
                if (setGeneralGameCount == null) {
                  return null;
                }
                setGeneralGameCount({
                  goal: foundGoal.resolvedGoal,
                  userId,
                  game,
                  count: event.currentTarget.checked ? 1 : 0,
                });
              }}
              label={isPlay ? label : undefined}
            />
          );
          const getButton = (
            userId: number,
            color: BingosyncColor,
            name: string,
            gameCount: number,
          ) => (
            <Button
              style={
                setGeneralGameCount == null
                  ? { pointerEvents: "none", cursor: "not-allowed" }
                  : undefined
              }
              color={getColorHex(color)}
              h={18}
              w={18}
              p={0}
              size="compact-xs"
              onClick={() => {
                if (setGeneralGameCount == null) {
                  return null;
                }
                setGeneralGameCount({
                  goal: foundGoal.resolvedGoal,
                  userId,
                  game,
                  count: gameCount + 1,
                });
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                if (setGeneralGameCount == null) {
                  return null;
                }
                setGeneralGameCount({
                  goal: foundGoal.resolvedGoal,
                  userId,
                  game,
                  count: Math.max(0, gameCount - 1),
                });
              }}
            >
              {gameCount}
            </Button>
          );

          if (isPlay) {
            const { userId, color, name } = generalTrackerPlayers[0];
            const counts = countState?.[userId];
            const gameCount = counts?.[game] ?? 0;
            if (cast.type === "check") {
              return getCheckbox(userId, color, name, gameCount, true);
            } else {
              return (
                <Group key={game} gap={6}>
                  {getButton(userId, color, name, gameCount)}
                  {label}
                </Group>
              );
            }
          }
          return (
            <Group key={game} gap={6}>
              {generalTrackerPlayers.map(({ userId, color, name }) => {
                const counts = countState?.[userId];
                const gameCount = counts?.[game] ?? 0;
                return (
                  <Tooltip key={userId} label={name}>
                    {cast.type === "check"
                      ? getCheckbox(userId, color, name, gameCount, false)
                      : getButton(userId, color, name, gameCount)}
                  </Tooltip>
                );
              })}
              {label}
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
