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
                0,
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
    // GIFT
    case "Collect {{gift_count}} gifts from games on this card":
      return "/general/winnerbit/Icon_Gift.png";
    // GOLD/CHERRY
    case "Cherry disk {{cherry_count}} games on this card":
      return "/general/winnerbit/Icon_Cherry.png";
    case "Gold disk {{gold_count}} games on this card":
      return "/general/winnerbit/Icon_Gold.png";
    // BOSS/LEVEL
    case "Beat 2 levels in 6 games on this card":
    case "Beat 4 levels in 5 games on this card":
    case "Beat 8 levels in 3 games on this card":
      return "/general/winnerbit/Icon_Level.png";
    case "Defeat 2 bosses in 3 games on this card":
    case "Defeat 7 bosses from games on this card":
    case "Defeat a boss in 5 games on this card":
      return "/general/winnerbit/Icon_Boss.png";
    // COLLECTATHON
    case "Collect 2 keys in 5 games":
      return "/general/winnerbit/Icon_Key.png";
    case "Open 2 chests in 5 games":
      return "/general/winnerbit/Icon_Chest.png";
    case "Buy an item from 2 unique shops in one run in 6 games":
      return "/general/winnerbit/Icon_Shop.png";
    case "Earn 2 extra lives/1-Ups in 5 games":
      return "/general/winnerbit/Icon_Life.png";
    case "Increase your base HP twice in 4 games":
      return "/general/winnerbit/Icon_HP.png";
    case "Surpass the top 5 score from 4 arcade leaderboards":
      return "/general/winnerbit/Icon_Leaderboard.png";
    case "Defeat 6 different enemy types in 6 games":
      // TODO: Get new icon
      return "/general/winnerbit/Icon_Unknown_Goal.png";
    // THEME
    case "CAMPANELLA TRILOGY: Beat 5 total worlds across Campanella 1, 2, and 3":
    case "SHOOTER: Beat 5 waves/stages across Elfazar's Hat, Seaside Drive, and Caramel Caramel":
    case "DAY JOB: Beat 9 levels across Rail Heist, Onion Delivery, and Bug Hunter":
    case "RACER: Win 12 races across Paint Chase, The Big Bell Race, and Quibble Race":
    case "PUZZLER: Beat 15 levels across Block Koala, Devilition, and Warptank":
    case "AMY: Beat 5 levels across Party House, Fist Hell, and Hot Foot":
    case "WAR IS BAD: Win 9 battles across Attactics, Avianos, and Combatants":
    case "METROIDVANIA: Collect 6 abilities across Porgy, Vainger, and Golfaria":
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
    // GIFT
    case "Collect {{gift_count}} gifts from games on this card":
      return "/general/sprites/IconGarden.png";
    // GOLD/CHERRY
    case "Cherry disk {{cherry_count}} games on this card":
      return "/general/sprites/IconCherry.png";
    case "Gold disk {{gold_count}} games on this card":
      return "/general/sprites/IconGold.png";
    // BOSS/LEVEL
    case "Beat 2 levels in 6 games on this card":
    case "Beat 4 levels in 5 games on this card":
    case "Beat 8 levels in 3 games on this card":
      return "/general/sprites/IconLevel.png";
    case "Defeat 2 bosses in 3 games on this card":
    case "Defeat 7 bosses from games on this card":
    case "Defeat a boss in 5 games on this card":
      return "/general/sprites/IconBoss.png";
    // COLLECTATHON
    case "Collect 2 keys in 5 games":
      return "/general/sprites/IconKey.png";
    case "Open 2 chests in 5 games":
      return "/general/sprites/IconChest.png";
    case "Buy an item from 2 unique shops in one run in 6 games":
      return "/general/sprites/IconShops.png";
    case "Earn 2 extra lives/1-Ups in 5 games":
      return "/general/sprites/Icon1up.png";
    case "Increase your base HP twice in 4 games":
      return "/general/sprites/IconHealth.png";
    case "Surpass the top 5 score from 4 arcade leaderboards":
      return "/general/sprites/IconLeaderboard.png";
    case "Defeat 6 different enemy types in 6 games":
      return "/general/sprites/IconEnemy.png";
    // THEME
    case "CAMPANELLA TRILOGY: Beat 5 total worlds across Campanella 1, 2, and 3":
      return "/general/sprites/IconCampTrilogy.png";
    case "SHOOTER: Beat 5 waves/stages across Elfazar's Hat, Seaside Drive, and Caramel Caramel":
      return "/general/sprites/IconShooter.png";
    case "DAY JOB: Beat 9 levels across Rail Heist, Onion Delivery, and Bug Hunter":
      return "/general/sprites/IconDayJob.png";
    case "RACER: Win 12 races across Paint Chase, The Big Bell Race, and Quibble Race":
      return "/general/sprites/IconRacer.png";
    case "PUZZLER: Beat 15 levels across Block Koala, Devilition, and Warptank":
      return "/general/sprites/IconPuzzler.png";
    case "AMY: Beat 5 levels across Party House, Fist Hell, and Hot Foot":
      return "/general/sprites/IconAmy.png";
    case "WAR IS BAD: Win 9 battles across Attactics, Avianos, and Combatants":
      return "/general/sprites/IconWarIsBad.png";
    case "METROIDVANIA: Collect 6 abilities across Porgy, Vainger, and Golfaria":
      return "/general/sprites/IconMetroidvania.png";
    default:
      return "/general/sprites/IconUnknown.png";
  }
}
