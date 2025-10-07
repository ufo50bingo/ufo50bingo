import { Game, GoalName } from "@/app/goals";
import { Anchor, Checkbox, Stack } from "@mantine/core";
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

type Props = {
  isFinished: boolean;
  gameToGoals: GameToGoals;
  name: GoalName;
  terminalCodes: Set<string>;
  generalState: null | undefined | GeneralGoalState;
  setGeneral: (goal: GoalName, newGenerals: GeneralGoalState) => unknown;
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
}: Props) {
  const showAll = generalState?.showAll ?? false;
  const checked = generalState?.leftChecked ?? new Set();
  const rightChecked = generalState?.rightChecked ?? new Set();

  console.log('checked is', checked);

  let target: number;
  let recommendations: RecommendationsWithTerminal;
  let onCardOnly = false;
  let descriptions: null | Descriptions = null;
  switch (name) {
    case "Collect 2 cherry disks from games on this card":
      target = 2;
      recommendations = CHERRIES;
      onCardOnly = true;
      break;
    case "Collect 3 cherry disks from games on this card":
      target = 3;
      recommendations = CHERRIES;
      onCardOnly = true;
      break;
    case "Collect 3 gold disks from games on this card":
      target = 3;
      recommendations = GOLDS;
      onCardOnly = true;
      break;
    case "Collect 4 gold disks from games on this card":
      target = 4;
      recommendations = GOLDS;
      onCardOnly = true;
      break;
    case "Collect 6 gifts from games on this card":
      target = 6;
      recommendations = GIFTS;
      onCardOnly = true;
      descriptions = GIFT_DESCRIPTIONS;
      break;
    case "Collect 7 gifts from games on this card":
      target = 7;
      recommendations = GIFTS;
      onCardOnly = true;
      descriptions = GIFT_DESCRIPTIONS;
      break;
    case "Collect 8 gifts from games on this card":
      target = 8;
      recommendations = GIFTS;
      onCardOnly = true;
      descriptions = GIFT_DESCRIPTIONS;
      break;
    case "ARCADE ACE: Gold Disk any 3 of the 16 “ARCADE” games":
      target = 3;
      recommendations = ARCADE;
      break;
    case "TRIATHLON: Gold Disk any 3 of the 5 “SPORT” games":
      target = 3;
      recommendations = SPORT;
      break;
    case "Collect a beverage in 6 games":
      target = 6;
      recommendations = BEVERAGE;
      break;
    case "Collect a food item in 8 games":
      target = 8;
      recommendations = FOOD;
      break;
    case "Beat 2 levels in 8 different games":
      target = 8;
      recommendations = TWO_LEVELS;
      break;
    case "Beat 4 levels in 5 different games":
      target = 5;
      recommendations = FOUR_LEVELS;
      break;
    case "Beat 8 levels in 3 different games":
      target = 3;
      recommendations = EIGHT_LEVELS;
      break;
    case "Collect a key in 7 games":
      target = 7;
      recommendations = KEYS;
      break;
    case "Open 2 chests in 5 games":
      target = 5;
      recommendations = TWO_CHESTS;
      break;
    case "Buy an item from a shop in 10 games":
      target = 10;
      recommendations = SHOPS;
      break;
    case "Find an easter egg UFO in 5 games":
      target = 5;
      recommendations = UFOS;
      break;
    case "Earn an extra life/1UP in 8 games":
      target = 8;
      recommendations = LIVES;
      break;
    case "Find an egg in 10 games":
      target = 10;
      recommendations = EGGS;
      break;
    case "Increase your base HP in 6 games":
      target = 6;
      recommendations = HP;
      break;
    case "Defeat 2 bosses in 4 different games":
      target = 4;
      recommendations = TWO_BOSSES;
      break;
    case "Defeat 7 bosses":
      target = 7;
      recommendations = BOSSES;
      break;
    case "Defeat a boss in 6 different games":
      target = 6;
      recommendations = BOSSES;
      break;
    case "Enter a top 3 score on 2 arcade leaderboards":
      target = 2;
      recommendations = TOP_3;
      descriptions = TOP_3_SCORES;
      break;
    case "Enter a top 3 score on 3 arcade leaderboards":
      target = 3;
      recommendations = TOP_3;
      descriptions = TOP_3_SCORES;
      break;
    case "Enter a top 5 score on 4 arcade leaderboards":
      target = 4;
      recommendations = TOP_5;
      descriptions = TOP_5_SCORES;
      break;

    case "PILOT PARTY: Collect 4 gifts: Campanella 1/2/3, Planet Zoldath, Pilot Quest, The Big Bell Race":
      descriptions = GIFT_DESCRIPTIONS;
    // intentional fall-through
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
      target = recommendations.always.length;
      break;
    default:
      return (
        <InfoCard title={isFinished ? <s>{name}</s> : name}>
          No info for this goal yet!
        </InfoCard>
      );
  }

  const titleStr = `${name} (${checked.size}/${target})`;
  const title = isFinished ? <s>{titleStr}</s> : titleStr;

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
    <InfoCard title={title}>
      <Stack gap={4}>
        {finalEntries.map((e) => {
          const [game, otherGoals] = e;
          const description = descriptions != null ? descriptions[game] : null;
          return (
            <Checkbox
              key={game}
              checked={checked.has(game)}
              onChange={(event) => {
                const newSet = new Set(checked);
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
              label={
                <GameInfo
                  game={game}
                  goals={otherGoals}
                  description={description}
                />
              }
            />
          );
        })}
        {hasMore ? (
          <Anchor onClick={() => setGeneral(name, {
            showAll: true,
            rightChecked,
            leftChecked: checked,
          })} size="sm">
            Show all options
          </Anchor>
        ) : null}
      </Stack>
    </InfoCard >
  );
}
