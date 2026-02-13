import { Game, ORDERED_GAMES } from "@/app/goals";
import { Anchor, Button, Checkbox, Group, Stack } from "@mantine/core";
import {
  TOP_5,
  RecommendationsWithTerminal,
  Descriptions,
  CHERRIES,
  GIFTS,
  GIFT_DESCRIPTIONS,
  TerminalEntry,
  GOLDS,
  TWO_LEVELS,
  FOUR_LEVELS,
  EIGHT_LEVELS,
  TWO_CHESTS,
  TWO_BOSSES,
  BOSSES,
  TOP_5_SCORES,
  TWO_SHOPS,
  TWO_HP,
  TWO_LIVES,
  TWO_KEYS,
  SIX_ENEMIES,
} from "./timeEstimates";
import { findGamesForGoal, GameToGoals } from "./findAllGames";
import InfoCard from "./InfoCard";
import GameInfo from "./GameInfo";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import getColorHex from "./getColorHex";
import BingosyncColored from "@/app/matches/BingosyncColored";
import { CountChange, CountState } from "./useSyncedState";
import { SortType } from "./useLocalState";
import { StandardGeneral } from "@/app/pastas/pastaTypes";
import { FoundGoal } from "@/app/findGoal";

type Props = {
  showAll: boolean;
  isFinished: boolean;
  gameToGoals: GameToGoals;
  foundGoal: FoundGoal<StandardGeneral, "general", string>;
  terminalCodes: Set<string>;
  countState: null | undefined | CountState;
  setGeneralGameCount: (change: CountChange) => unknown;
  addShowAll: (goal: string) => unknown;
  leftColor: BingosyncColor;
  rightColor: BingosyncColor;
  height: null | undefined | number;
  sortType: SortType;
};

function getOtherGoals(
  entry: TerminalEntry,
  gameToGoals: GameToGoals,
  resolvedGoal: string,
): null | ReadonlyArray<[string, number]> {
  const game = typeof entry === "string" ? entry : entry.game;
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
}: Props) {
  const leftCounts = countState?.leftCounts ?? {};
  const rightCounts = countState?.rightCounts ?? {};

  let recommendations: RecommendationsWithTerminal;
  let onCardOnly = false;
  let descriptions: null | Descriptions = null;
  let isChecks = true;
  switch (foundGoal.goal) {
    // GIFT
    case "Collect {{gift_count}} gifts from games on this card":
      recommendations = GIFTS;
      onCardOnly = true;
      descriptions = GIFT_DESCRIPTIONS;
      break;
    // GOLD/CHERRY
    case "Cherry disk {{cherry_count}} games on this card":
      recommendations = CHERRIES;
      onCardOnly = true;
      break;
    case "Gold disk {{gold_count}} games on this card":
      recommendations = GOLDS;
      onCardOnly = true;
      break;
    // BOSS/LEVEL
    case "Beat 2 levels in 6 games on this card":
      recommendations = TWO_LEVELS;
      onCardOnly = true;
      break;
    case "Beat 4 levels in 5 games on this card":
      recommendations = FOUR_LEVELS;
      onCardOnly = true;
      break;
    case "Beat 8 levels in 3 games on this card":
      recommendations = EIGHT_LEVELS;
      onCardOnly = true;
      break;
    case "Defeat 2 bosses in 3 games on this card":
      recommendations = TWO_BOSSES;
      onCardOnly = true;
      break;
    case "Defeat 7 bosses from games on this card":
      recommendations = BOSSES;
      isChecks = false;
      onCardOnly = true;
      break;
    case "Defeat a boss in 5 games on this card":
      recommendations = BOSSES;
      onCardOnly = true;
      break;
    // COLLECTATHON
    case "Buy an item from 2 unique shops in one run in 6 games":
      recommendations = TWO_SHOPS;
      break;
    case "Increase your base HP twice in 4 games":
      recommendations = TWO_HP;
      break;
    case "Open 2 chests in 5 games":
      recommendations = TWO_CHESTS;
      break;
    case "Earn 2 extra lives in 5 games":
      recommendations = TWO_LIVES;
      break;
    case "Collect 2 keys in 5 games":
      recommendations = TWO_KEYS;
      break;
    case "Surpass the top 5 score from 4 arcade leaderboards":
      recommendations = TOP_5;
      descriptions = TOP_5_SCORES;
      break;
    case "Defeat 6 different enemy types in 6 games":
      recommendations = SIX_ENEMIES;
      break;
    // THEME
    case "CAMPANELLA TRILOGY: Beat 5 total worlds across Campanella 1, 2, and 3":
    case "SHOOTER: Beat 5 waves/stages across Elfazar's Hat, Seaside Drive, and Caramel Caramel":
    case "DAY JOB: Beat 9 levels across Rail Heist, Onion Delivery, and Bug Hunter":
    case "RACER: Win 12 races across Paint Chase, The Big Bell Race, and Quibble Race":
    case "PUZZLER: Beat 15 levels across Block Koala, Devilition, and Warptank":
    case "AMY: Beat 5 levels across Party House, Fist Hell, and Hot Foot":
    case "WAR IS BAD: Win 9 battles across Attactics, Avianos, and Combatants":
    case "METROIDVANIA: Collect 6 abilities across Porgy, Vainger, and Golfaria":
      recommendations = {
        always: findGamesForGoal(foundGoal.resolvedGoal),
        synergy: [],
        never: [],
      };
      isChecks = false;
      break;
    default:
      return (
        <InfoCard
          title={
            isFinished ? (
              <s>{foundGoal.resolvedGoal}</s>
            ) : (
              foundGoal.resolvedGoal
            )
          }
        >
          No info for this goal yet!
        </InfoCard>
      );
  }

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
    [TerminalEntry, null | ReadonlyArray<[string, number]>]
  > = recommendations.always.map((e) => [
    e,
    getOtherGoals(e, gameToGoals, foundGoal.resolvedGoal),
  ]);
  const synergyWithOnCard: ReadonlyArray<
    [TerminalEntry, null | ReadonlyArray<[string, number]>]
  > = recommendations.synergy.map((e) => [
    e,
    getOtherGoals(e, gameToGoals, foundGoal.resolvedGoal),
  ]);
  const neverWithOnCard: ReadonlyArray<
    [TerminalEntry, null | ReadonlyArray<[string, number]>]
  > = recommendations.never.map((e) => [
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
    null | [Game, null | ReadonlyArray<[string, number]>]
  > = entries.map((pair) => {
    const e = pair[0];
    if (typeof e === "string") {
      return [e, pair[1]];
    }
    return terminalCodes.has(e.code) === (e.type === "include")
      ? [e.game, pair[1]]
      : null;
  });

  const nonNullEntries = nullableEntries.filter((e) => e != null);
  const finalEntries = onCardOnly
    ? nonNullEntries.filter((e) => e[1] != null)
    : nonNullEntries;

  switch (sortType) {
    case "fast":
      break;
    case "alphabetical":
      finalEntries.sort((a, b) => a[0].localeCompare(b[0]));
      break;
    case "chronological":
      finalEntries.sort(
        (a, b) => ORDERED_GAMES.indexOf(a[0]) - ORDERED_GAMES.indexOf(b[0]),
      );
      break;
  }

  return (
    <InfoCard
      height={height}
      title={title}
      description={
        isChecks ? undefined : "Left click increases, right click decreases"
      }
    >
      <Stack gap={4}>
        {finalEntries.map((e) => {
          const [game, otherGoals] = e;
          const description = descriptions != null ? descriptions[game] : null;
          return (
            <Group key={game} gap={6}>
              {isChecks ? (
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
