import { Game, GoalName, ORDERED_GAMES } from "@/app/goals";
import { Anchor, Button, Checkbox, Group, Stack } from "@mantine/core";
import {
  // TOP_3,
  TOP_5,
  RecommendationsWithTerminal,
  Descriptions,
  CHERRIES,
  GIFTS,
  GIFT_DESCRIPTIONS,
  TerminalEntry,
  GOLDS,
  ARCADE,
  SPORT,
  BEVERAGE,
  FOOD,
  TWO_LEVELS,
  FOUR_LEVELS,
  EIGHT_LEVELS,
  KEYS,
  TWO_CHESTS,
  SHOPS,
  UFOS,
  LIVES,
  EGGS,
  HP,
  TWO_BOSSES,
  BOSSES,
  // TOP_3_SCORES,
  TOP_5_SCORES,
} from "./timeEstimates";
import { findGamesForGoal, GameToGoals } from "./findAllGames";
import InfoCard from "./InfoCard";
import GameInfo from "./GameInfo";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import getColorHex from "./getColorHex";
import BingosyncColored from "@/app/matches/BingosyncColored";
import { CountChange, CountState } from "./useSyncedState";
import { SortType } from "./useLocalState";

type Props = {
  showAll: boolean;
  isFinished: boolean;
  gameToGoals: GameToGoals;
  name: GoalName;
  terminalCodes: Set<string>;
  countState: null | undefined | CountState;
  setGeneralGameCount: (change: CountChange) => unknown;
  addShowAll: (goal: GoalName) => unknown;
  leftColor: BingosyncColor;
  rightColor: BingosyncColor;
  height: null | undefined | number;
  sortType: SortType;
};

function getOtherGoals(
  entry: TerminalEntry,
  gameToGoals: GameToGoals,
  goal: GoalName
): null | ReadonlyArray<[GoalName, number]> {
  const game = typeof entry === "string" ? entry : entry.game;
  const goals = gameToGoals[game];
  if (goals == null || goals.length === 0) {
    return null;
  }
  const otherGoals = goals.filter((g) => g[0] !== goal);
  return otherGoals.length === 0 ? null : otherGoals;
}

export default function GeneralGoal({
  showAll,
  gameToGoals,
  name,
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
  switch (name) {
    case "Collect 2 cherry disks from games on this card":
    case "Collect 3 cherry disks from games on this card":
      recommendations = CHERRIES;
      onCardOnly = true;
      break;
    case "Collect 3 gold disks from games on this card":
    case "Collect 4 gold disks from games on this card":
      recommendations = GOLDS;
      onCardOnly = true;
      break;
    case "Collect 6 gifts from games on this card":
    case "Collect 7 gifts from games on this card":
    case "Collect 8 gifts from games on this card":
      recommendations = GIFTS;
      onCardOnly = true;
      descriptions = GIFT_DESCRIPTIONS;
      break;
    case "ARCADE ACE: Gold Disk any 3 of the 16 “ARCADE” games":
      recommendations = ARCADE;
      break;
    case "TRIATHLON: Gold Disk any 3 of the 5 “SPORT” games":
      recommendations = SPORT;
      break;
    case "Collect a beverage in 6 games":
      recommendations = BEVERAGE;
      break;
    case "Collect a food item in 8 games":
      recommendations = FOOD;
      break;
    case "Beat 2 levels in 8 different games":
      recommendations = TWO_LEVELS;
      break;
    case "Beat 4 levels in 5 different games":
      recommendations = FOUR_LEVELS;
      break;
    case "Beat 8 levels in 3 different games":
      recommendations = EIGHT_LEVELS;
      break;
    case "Collect a key in 7 games":
      recommendations = KEYS;
      break;
    case "Open 2 chests in 5 games":
      recommendations = TWO_CHESTS;
      break;
    case "Buy an item from a shop in 10 games":
      recommendations = SHOPS;
      break;
    case "Find an easter egg UFO in 5 games":
      recommendations = UFOS;
      break;
    case "Earn an extra life/1UP in 8 games":
      recommendations = LIVES;
      break;
    case "Find an egg in 10 games":
      recommendations = EGGS;
      break;
    case "Increase your base HP in 6 games":
      recommendations = HP;
      break;
    case "Defeat 2 bosses in 4 different games":
      recommendations = TWO_BOSSES;
      break;
    case "Defeat 7 bosses":
      recommendations = BOSSES;
      isChecks = false;
      break;
    case "Defeat a boss in 6 different games":
      recommendations = BOSSES;
      break;
    // case "Enter a top 3 score on 2 arcade leaderboards":
    //   recommendations = TOP_3;
    //   descriptions = TOP_3_SCORES;
    //   break;
    // case "Enter a top 3 score on 3 arcade leaderboards":
    //   recommendations = TOP_3;
    //   descriptions = TOP_3_SCORES;
    //   break;
    case "Enter a top 5 score on 4 arcade leaderboards":
      recommendations = TOP_5;
      descriptions = TOP_5_SCORES;
      break;

    case "PILOT PARTY: Collect 4 gifts: Campanella 1/2/3, Planet Zoldath, Pilot Quest, The Big Bell Race":
      descriptions = GIFT_DESCRIPTIONS;
      const allGames = findGamesForGoal(name);
      recommendations = {
        always: GIFTS.always
          .concat(GIFTS.synergy)
          .concat(GIFTS.never)
          .filter((gift) => allGames.includes(gift)),
        synergy: [],
        never: [],
      };
      break;
    case "ALPHA TRILOGY: Gold Velgress, Overbold, and Quibble Race as Alpha":
    case "AMY: Playing as Amy, beat 1 level in Party House, 2 in Hot Foot, 2 in Fist Hell":
    case "CAMPANELLA TRILOGY: Beat two worlds in Campanella, two in Campanella 2, one in Campanella 3":
    case "DAY JOB: Beat 1 level in Bug Hunter, 2 in Onion Delivery, 3 in Rail Heist":
    case "METROIDVANIA: Collect Abilities: 3 in Porgy, 2 in Vainger, 1 in Golfaria":
    case "PUZZLER: Beat 5 levels in Block Koala, Camouflage, Warptank":
    case "RACER: Win 4 races in Paint Chase, The Big Bell Race, Quibble Race":
    case "ROLE-PLAYER: Level up all your characters twice in Divers, Valbrace, Grimstone":
    case "WAR IS BAD: Win 3 battles in Attactics, Avianos, Combatants":
      recommendations = {
        always: findGamesForGoal(name),
        synergy: [],
        never: [],
      };
      break;
    default:
      return (
        <InfoCard title={isFinished ? <s>{name}</s> : name}>
          No info for this goal yet!
        </InfoCard>
      );
  }

  const titleEl = (
    <>
      {name} (
      <BingosyncColored color={leftColor}>
        {Object.keys(leftCounts).reduce(
          (acc, game) => acc + leftCounts[game],
          0
        )}
      </BingosyncColored>{" "}
      <BingosyncColored color={rightColor}>
        {Object.keys(rightCounts).reduce(
          (acc, game) => acc + rightCounts[game],
          0
        )}
      </BingosyncColored>
      )
    </>
  );
  const title = isFinished ? <s>{titleEl}</s> : titleEl;

  const alwaysWithOnCard: ReadonlyArray<
    [TerminalEntry, null | ReadonlyArray<[GoalName, number]>]
  > = recommendations.always.map((e) => [
    e,
    getOtherGoals(e, gameToGoals, name),
  ]);
  const synergyWithOnCard: ReadonlyArray<
    [TerminalEntry, null | ReadonlyArray<[GoalName, number]>]
  > = recommendations.synergy.map((e) => [
    e,
    getOtherGoals(e, gameToGoals, name),
  ]);
  const neverWithOnCard: ReadonlyArray<
    [TerminalEntry, null | ReadonlyArray<[GoalName, number]>]
  > = recommendations.never.map((e) => [
    e,
    getOtherGoals(e, gameToGoals, name),
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
    null | [Game, null | ReadonlyArray<[GoalName, number]>]
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
        (a, b) => ORDERED_GAMES.indexOf(a[0]) - ORDERED_GAMES.indexOf(b[0])
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
                        goal: name,
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
                        goal: name,
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
                        goal: name,
                        is_left: true,
                        game,
                        count: (leftCounts[game] ?? 0) + 1,
                      });
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setGeneralGameCount({
                        goal: name,
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
                        goal: name,
                        is_left: false,
                        game,
                        count: (rightCounts[game] ?? 0) + 1,
                      });
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setGeneralGameCount({
                        goal: name,
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
          <Anchor onClick={() => addShowAll(name)} size="sm">
            Show all options
          </Anchor>
        ) : null}
      </Stack>
    </InfoCard>
  );
}
