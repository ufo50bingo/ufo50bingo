import classes from "./GeneralIcons.module.css";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { IconType } from "./useLocalState";
import { GeneralCounts } from "./CastPage";
import SideCell from "./SideCell";
import { GeneralItem } from "./Cast";
import { StandardGeneral } from "@/app/pastas/pastaTypes";

type IconProps = {
  goal: string;
  color: BingosyncColor;
  squareColor: BingosyncColor;
  src: string;
  count: number;
  iconType: IconType;
};

function Icon({ goal, src, count, color, squareColor, iconType }: IconProps) {
  const iconClass =
    iconType === "sprites"
      ? `${classes.icon} ${classes.spritesIcon}`
      : classes.icon;
  const imgClass =
    squareColor !== "blank" ? `${iconClass} ${classes.grayscale}` : iconClass;
  const tag =
    squareColor === color ? (
      <IconCircleCheckFilled
        className={classes.tagPosition}
        color="green"
        size={24}
      />
    ) : (
      <div className={classes.tag}>{count}</div>
    );
  return (
    <SideCell>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={imgClass} src={src} alt={goal} />
      {tag}
    </SideCell>
  );
}

type Props = {
  color: BingosyncColor;
  generalGoals: ReadonlyArray<GeneralItem>;
  generalState: GeneralCounts;
  isLeft: boolean;
  iconType: IconType;
  isHidden: boolean;
};

export default function GeneralIcons({
  color,
  generalGoals,
  generalState,
  isLeft,
  iconType,
  isHidden,
}: Props) {
  return generalGoals.map((item) => {
    const { goal, resolvedGoal } = item.foundGoal;
    const countState = isLeft
      ? generalState[resolvedGoal]?.leftCounts
      : generalState[resolvedGoal]?.rightCounts;
    return (
      <Icon
        key={resolvedGoal}
        goal={resolvedGoal}
        color={color}
        squareColor={item.color}
        count={
          countState == null
            ? 0
            : Object.keys(countState).reduce(
                (acc, game) => acc + countState[game],
                0
              )
        }
        iconType={iconType}
        src={
          iconType === "sprites"
            ? getSpritesSrc(goal, isHidden)
            : getWinnerBitSrc(goal, isHidden)
        }
      />
    );
  });
}

function getWinnerBitSrc(goal: StandardGeneral, isHidden: boolean): string {
  if (isHidden) {
    return "/general/winnerbit/Icon_Unrevealed_Goal.png";
  }
  switch (goal) {
    case "Collect {{cherry_count}} cherry disks from games on this card":
      return "/general/winnerbit/Icon_Cherry.png";
    case "Collect {{gold_count}} gold disks from games on this card":
      return "/general/winnerbit/Icon_Gold.png";
    case "Collect {{gift_count}} gifts from games on this card":
      return "/general/winnerbit/Icon_Gift.png";
    case "Collect a beverage in 6 games":
      return "/general/winnerbit/Icon_Beverage.png";
    case "Collect a food item in 8 games":
      return "/general/winnerbit/Icon_Food.png";
    case "Beat 2 levels in 8 different games":
    case "Beat 4 levels in 5 different games":
    case "Beat 8 levels in 3 different games":
      return "/general/winnerbit/Icon_Level.png";
    case "Collect a key in 7 games":
      return "/general/winnerbit/Icon_Key.png";
    case "Open 2 chests in 5 games":
      return "/general/winnerbit/Icon_Chest.png";
    case "Buy an item from a shop in 10 games":
      return "/general/winnerbit/Icon_Shop.png";
    case "Find an easter egg UFO in 5 games":
      return "/general/winnerbit/Icon_UFO.png";
    case "Earn an extra life/1UP in 8 games":
      return "/general/winnerbit/Icon_Life.png";
    case "Find an egg in 10 games":
      return "/general/winnerbit/Icon_Egg.png";
    case "Increase your base HP in 6 games":
      return "/general/winnerbit/Icon_HP.png";
    case "Defeat 2 bosses in 4 different games":
    case "Defeat 7 bosses":
    case "Defeat a boss in 6 different games":
      return "/general/winnerbit/Icon_Boss.png";
    // case "Enter a top 3 score on 2 arcade leaderboards":
    // case "Enter a top 3 score on 3 arcade leaderboards":
    case "Enter a top 5 score on 4 arcade leaderboards":
      return "/general/winnerbit/Icon_Leaderboard.png";
    case "PILOT PARTY: Collect 4 gifts: Campanella 1/2/3, Planet Zoldath, Pilot Quest, The Big Bell Race":
    case "ALPHA TRILOGY: Gold Velgress, Overbold, and Quibble Race as Alpha":
    case "AMY: Playing as Amy, beat 1 level in Party House, 2 in Hot Foot, 2 in Fist Hell":
    case "CAMPANELLA TRILOGY: Beat two worlds in Campanella, two in Campanella 2, one in Campanella 3":
    case "DAY JOB: Beat 1 level in Bug Hunter, 2 in Onion Delivery, 3 in Rail Heist":
    case "METROIDVANIA: Collect Abilities: 3 in Porgy, 2 in Vainger, 1 in Golfaria":
    case "PUZZLER: Beat 5 levels in Block Koala, Camouflage, Warptank":
    case "RACER: Win 4 races in Paint Chase, The Big Bell Race, Quibble Race":
    case "ROLE-PLAYER: Level up all your characters twice in Divers, Valbrace, Grimstone":
    case "WAR IS BAD: Win 3 battles in Attactics, Avianos, Combatants":
    case "ARCADE ACE: Gold Disk any 3 of the 16 “ARCADE” games":
    case "TRIATHLON: Gold Disk any 3 of the 5 “SPORT” games":
      return "/general/winnerbit/Icon_Multi-Game_Generic.png";
    default:
      return "/general/winnerbit/Icon_Unknown_Goal.png";
  }
}

function getSpritesSrc(goal: StandardGeneral, isHidden: boolean): string {
  if (isHidden) {
    return "/general/sprites/IconUnknown.png";
  }
  switch (goal) {
    case "Collect {{cherry_count}} cherry disks from games on this card":
      return "/general/sprites/IconCherry.png";
    case "Collect {{gold_count}} gold disks from games on this card":
      return "/general/sprites/IconGold.png";
    case "Collect {{gift_count}} gifts from games on this card":
      return "/general/sprites/IconGarden.png";
    case "ARCADE ACE: Gold Disk any 3 of the 16 “ARCADE” games":
      return "/general/sprites/IconAce.png";
    case "TRIATHLON: Gold Disk any 3 of the 5 “SPORT” games":
      return "/general/sprites/IconTriathlon.png";
    case "Collect a beverage in 6 games":
      return "/general/sprites/IconBev.png";
    case "Collect a food item in 8 games":
      return "/general/sprites/IconFood.png";
    case "Beat 2 levels in 8 different games":
    case "Beat 4 levels in 5 different games":
    case "Beat 8 levels in 3 different games":
      return "/general/sprites/IconLevel.png";
    case "Collect a key in 7 games":
      return "/general/sprites/IconKey.png";
    case "Open 2 chests in 5 games":
      return "/general/sprites/IconChest.png";
    case "Buy an item from a shop in 10 games":
      return "/general/sprites/IconShops.png";
    case "Find an easter egg UFO in 5 games":
      return "/general/sprites/IconUfo.png";
    case "Earn an extra life/1UP in 8 games":
      return "/general/sprites/Icon1up.png";
    case "Find an egg in 10 games":
      return "/general/sprites/IconEgg.png";
    case "Increase your base HP in 6 games":
      return "/general/sprites/IconHealth.png";
    case "Defeat 2 bosses in 4 different games":
    case "Defeat 7 bosses":
    case "Defeat a boss in 6 different games":
      return "/general/sprites/IconBoss.png";
    // case "Enter a top 3 score on 2 arcade leaderboards":
    // case "Enter a top 3 score on 3 arcade leaderboards":
    case "Enter a top 5 score on 4 arcade leaderboards":
      return "/general/sprites/IconLeaderboard.png";
    case "PILOT PARTY: Collect 4 gifts: Campanella 1/2/3, Planet Zoldath, Pilot Quest, The Big Bell Race":
      return "/general/sprites/IconPilot.png";
    case "ALPHA TRILOGY: Gold Velgress, Overbold, and Quibble Race as Alpha":
      return "/general/sprites/IconAlpha.png";
    case "AMY: Playing as Amy, beat 1 level in Party House, 2 in Hot Foot, 2 in Fist Hell":
      return "/general/sprites/IconAmy.png";
    case "CAMPANELLA TRILOGY: Beat two worlds in Campanella, two in Campanella 2, one in Campanella 3":
      return "/general/sprites/IconCampTrilogy.png";
    case "DAY JOB: Beat 1 level in Bug Hunter, 2 in Onion Delivery, 3 in Rail Heist":
      return "/general/sprites/IconDayJob.png";
    case "METROIDVANIA: Collect Abilities: 3 in Porgy, 2 in Vainger, 1 in Golfaria":
      return "/general/sprites/IconMetroidvania.png";
    case "PUZZLER: Beat 5 levels in Block Koala, Camouflage, Warptank":
      return "/general/sprites/IconPuzzler.png";
    case "RACER: Win 4 races in Paint Chase, The Big Bell Race, Quibble Race":
      return "/general/sprites/IconRacer.png";
    case "ROLE-PLAYER: Level up all your characters twice in Divers, Valbrace, Grimstone":
      return "/general/sprites/IconRoleplayer.png";
    case "WAR IS BAD: Win 3 battles in Attactics, Avianos, Combatants":
      return "/general/sprites/IconWarIsBad.png";
    default:
      return "/general/sprites/IconUnknown.png";
  }
}
