import { Game, GoalName } from "@/app/goals";
import { Anchor, Checkbox, Group, Stack } from "@mantine/core";
import {
  TOP_3,
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
  TOP_3_SCORES,
  TOP_5_SCORES,
} from "./timeEstimates";
import { findGamesForGoal, GameToGoals } from "./findAllGames";
import InfoCard from "./InfoCard";
import GameInfo from "./GameInfo";
import { GeneralGoalState } from "./useCasterState";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import getColorHex from "./getColorHex";
import BingosyncColored from "@/app/matches/BingosyncColored";

type Props = {
  isFinished: boolean;
  gameToGoals: GameToGoals;
  name: GoalName;
  terminalCodes: Set<string>;
  generalState: null | undefined | GeneralGoalState;
  setGeneral: (goal: GoalName, newGenerals: GeneralGoalState) => unknown;
  leftColor: BingosyncColor;
  rightColor: BingosyncColor;
  height: null | undefined | number;
};

function getOtherGoals(
  entry: TerminalEntry,
  gameToGoals: GameToGoals,
  goal: GoalName
): null | ReadonlyArray<GoalName> {
  const game = typeof entry === "string" ? entry : entry.game;
  const goals = gameToGoals[game];
  if (goals == null || goals.length === 0) {
    return null;
  }
  const otherGoals = goals.filter((g) => g !== goal);
  return otherGoals.length === 0 ? null : otherGoals;
}

export default function GeneralGoal({
  gameToGoals,
  name,
  isFinished,
  terminalCodes,
  generalState,
  setGeneral,
  leftColor,
  rightColor,
  height,
}: Props) {
  const showAll = generalState?.showAll ?? false;
  const leftChecked = generalState?.leftChecked ?? new Set();
  const rightChecked = generalState?.rightChecked ?? new Set();

  let recommendations: RecommendationsWithTerminal;
  let onCardOnly = false;
  let descriptions: null | Descriptions = null;
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
      // change back to true
      onCardOnly = false;
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
      break;
    case "Defeat a boss in 6 different games":
      recommendations = BOSSES;
      break;
    case "Enter a top 3 score on 2 arcade leaderboards":
      recommendations = TOP_3;
      descriptions = TOP_3_SCORES;
      break;
    case "Enter a top 3 score on 3 arcade leaderboards":
      recommendations = TOP_3;
      descriptions = TOP_3_SCORES;
      break;
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
      <BingosyncColored color={leftColor}>{leftChecked.size}</BingosyncColored>{" "}
      <BingosyncColored color={rightColor}>
        {rightChecked.size}
      </BingosyncColored>
      )
    </>
  );
  const title = isFinished ? <s>{titleEl}</s> : titleEl;

  const alwaysWithOnCard: ReadonlyArray<
    [TerminalEntry, null | ReadonlyArray<GoalName>]
  > = recommendations.always.map((e) => [
    e,
    getOtherGoals(e, gameToGoals, name),
  ]);
  const synergyWithOnCard: ReadonlyArray<
    [TerminalEntry, null | ReadonlyArray<GoalName>]
  > = recommendations.synergy.map((e) => [
    e,
    getOtherGoals(e, gameToGoals, name),
  ]);
  const neverWithOnCard: ReadonlyArray<
    [TerminalEntry, null | ReadonlyArray<GoalName>]
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
    null | [Game, null | ReadonlyArray<GoalName>]
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
  return (
    <InfoCard height={height} title={title}>
      <Stack gap={4}>
        {finalEntries.map((e) => {
          const [game, otherGoals] = e;
          const description = descriptions != null ? descriptions[game] : null;
          return (
            <Group key={game} gap={6}>
              <Checkbox
                color={getColorHex(leftColor)}
                checked={leftChecked.has(game)}
                onChange={(event) => {
                  const newSet = new Set(leftChecked);
                  if (event.currentTarget.checked) {
                    newSet.add(game);
                  } else {
                    newSet.delete(game);
                  }
                  setGeneral(name, {
                    showAll,
                    rightChecked,
                    leftChecked: newSet,
                  });
                }}
              />
              <Checkbox
                color={getColorHex(rightColor)}
                checked={rightChecked.has(game)}
                onChange={(event) => {
                  const newSet = new Set(rightChecked);
                  if (event.currentTarget.checked) {
                    newSet.add(game);
                  } else {
                    newSet.delete(game);
                  }
                  setGeneral(name, {
                    showAll,
                    rightChecked: newSet,
                    leftChecked,
                  });
                }}
              />
              <GameInfo
                game={game}
                goals={otherGoals}
                description={description}
              />
            </Group>
          );
        })}
        {hasMore ? (
          <Anchor
            onClick={() =>
              setGeneral(name, {
                showAll: true,
                rightChecked,
                leftChecked,
              })
            }
            size="sm"
          >
            Show all options
          </Anchor>
        ) : null}
      </Stack>
    </InfoCard>
  );
}
