import { FoundGoalWithCast } from "@/app/findGoal";
import { getCastImage } from "./iconSets";
import { StandardGeneral } from "@/app/pastas/pastaTypes";
import classes from "./GeneralIcon.module.css";
import { CastImage } from "@/app/generator/ufoGenerator";
import { Font } from "@/app/font/useFont";
import getFontClassname from "@/app/font/getFontClassname";
import { IconCircleCheckFilled } from "@tabler/icons-react";

type Props = {
  foundGoal: FoundGoalWithCast<string, string, string>;
  iconType: string;
  isHidden: boolean;
  isGray: boolean;
  countInfo?: {
    hasCheck: boolean;
    count: number;
    font: Font;
  };
};

export default function GeneralIcon({
  foundGoal,
  iconType,
  isHidden,
  isGray,
  countInfo,
}: Props) {
  const image =
    (isHidden ? null : getCastImage(foundGoal.cast, iconType)) ??
    getBuiltInIcon(iconType, foundGoal.goal as StandardGeneral, isHidden);

  const iconClass =
    image.is_pixel === true
      ? `${classes.icon} ${classes.spritesIcon}`
      : classes.icon;
  const imgClass = isGray ? `${iconClass} ${classes.grayscale}` : iconClass;

  const mainImg = (
    <img className={imgClass} src={image.src} alt={foundGoal.resolvedGoal} />
  );

  if (countInfo == null) {
    return mainImg;
  }

  const tag =
    countInfo.hasCheck && countInfo.font === "ufo50" ? (
      <div className={classes.tag}>
        <img
          className={classes.smallCheck}
          src="/elf_check.png"
          alt="checkmark"
        />
      </div>
    ) : countInfo.hasCheck ? (
      <IconCircleCheckFilled
        className={classes.tagPosition}
        color="green"
        size={24}
      />
    ) : (
      <div className={classes.tag}>
        <span className={getFontClassname(countInfo.font, countInfo.count > 9)}>
          {countInfo.count}
        </span>
      </div>
    );
  return (
    <>
      {mainImg}
      {tag}
    </>
  );
}

function getBuiltInIcon(
  iconSet: string,
  goal: StandardGeneral,
  isHidden: boolean,
): CastImage {
  switch (iconSet) {
    case "Sprites":
      return { src: getSpritesSrc(goal, isHidden), is_pixel: true };
    case "Classic":
      return { src: getClassicSrc(goal, isHidden), is_pixel: true };
    default:
      return { src: getWinnerBitSrc(goal, isHidden), is_pixel: false };
  }
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
    // LEVEL
    case "Beat 2 levels in 6 games on this card":
    case "Beat 2 levels in 6 games":
    case "Beat 4 levels in 5 games on this card":
    case "Beat 4 levels in 5 games":
    case "Beat 8 levels in 3 games on this card":
    case "Beat 8 levels in 3 games":
      return "/general/winnerbit/Icon_Level.png";
    // BOSS/ENEMY
    case "Defeat 2 bosses in 4 games on this card":
    case "Defeat 2 bosses in 4 games":
    case "Defeat 8 bosses from games on this card":
    case "Defeat a boss in 6 games on this card":
    case "Defeat a boss in 6 games":
      return "/general/winnerbit/Icon_Boss.png";
    // THEME
    case "SHOOTER: Beat 5 levels across Elfazar's Hat, Seaside Drive, and Caramel Caramel":
    case "DAY JOB: Beat 9 levels across Rail Heist, Onion Delivery, and Bug Hunter":
    case "RACER: Win 12 races across Paint Chase, The Big Bell Race, and Quibble Race":
    case "PUZZLER: Beat 12 levels across Block Koala, Devilition, and Warptank":
    case "AMY: Beat 5 levels across Party House, Fist Hell, and Hot Foot, with 1+ in each":
    case "WAR IS BAD: Win 7 battles across Avianos, Combatants, and Lords of Diskonia":
    case "METROIDVANIA: Collect 6 abilities across Porgy, Vainger, and Golfaria":
    case "ROLE PLAYER: Level up your highest-level character 5 total times across Grimstone, Divers, Valbrace":
    case "REVOLUTIONARY: Beat 5 levels across Mortol, Cyber Owls, Rock On! Island":
    case "TRADER: Buy or Trade in 7 places across Barbuta, Planet Zoldath, Pilot Quest":
      return "/general/winnerbit/Icon_Multi-Game_Generic.png";
    default:
      goal satisfies never;
      return "/general/winnerbit/Icon_Unknown_Goal.png";
  }
}

function getClassicSrc(goal: StandardGeneral, isHidden: boolean): string {
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
    // LEVEL
    case "Beat 2 levels in 6 games on this card":
    case "Beat 2 levels in 6 games":
    case "Beat 4 levels in 5 games on this card":
    case "Beat 4 levels in 5 games":
    case "Beat 8 levels in 3 games on this card":
    case "Beat 8 levels in 3 games":
      return "/general/sprites/IconLevel.png";
    // BOSS/ENEMY
    case "Defeat 2 bosses in 4 games on this card":
    case "Defeat 2 bosses in 4 games":
    case "Defeat 8 bosses from games on this card":
    case "Defeat a boss in 6 games on this card":
    case "Defeat a boss in 6 games":
      return "/general/sprites/IconBoss.png";
    // THEME
    case "SHOOTER: Beat 5 levels across Elfazar's Hat, Seaside Drive, and Caramel Caramel":
      return "/general/sprites/IconShooter.png";
    case "DAY JOB: Beat 9 levels across Rail Heist, Onion Delivery, and Bug Hunter":
      return "/general/sprites/IconDayJob.png";
    case "RACER: Win 12 races across Paint Chase, The Big Bell Race, and Quibble Race":
      return "/general/sprites/IconRacer.png";
    case "PUZZLER: Beat 12 levels across Block Koala, Devilition, and Warptank":
      return "/general/sprites/IconPuzzler.png";
    case "AMY: Beat 5 levels across Party House, Fist Hell, and Hot Foot, with 1+ in each":
      return "/general/sprites/IconAmy.png";
    case "WAR IS BAD: Win 7 battles across Avianos, Combatants, and Lords of Diskonia":
      return "/general/sprites/IconWarIsBad.png";
    case "METROIDVANIA: Collect 6 abilities across Porgy, Vainger, and Golfaria":
      return "/general/sprites/IconMetroidvania.png";
    case "ROLE PLAYER: Level up your highest-level character 5 total times across Grimstone, Divers, Valbrace":
      return "/general/sprites/IconRoleplayer.png";
    case "REVOLUTIONARY: Beat 5 levels across Mortol, Cyber Owls, Rock On! Island":
      return "/general/sprites/IconRevolutionary.png";
    case "TRADER: Buy or Trade in 7 places across Barbuta, Planet Zoldath, Pilot Quest":
      return "/general/sprites/IconTrader.png";
    default:
      goal satisfies never;
      return "/general/sprites/IconUnknown.png";
  }
}

function getSpritesSrc(goal: StandardGeneral, isHidden: boolean): string {
  if (isHidden) {
    return "/general/sprites/IconUnknown.png";
  }
  switch (goal) {
    // GIFT
    case "Collect {{gift_count}} gifts from games on this card":
      return "/general/matt/GIFT.png";
    // GOLD/CHERRY
    case "Cherry disk {{cherry_count}} games on this card":
      return "/general/matt/CHERRY.png";
    case "Gold disk {{gold_count}} games on this card":
      return "/general/matt/GOLD.png";
    // LEVEL
    case "Beat 2 levels in 6 games on this card":
    case "Beat 2 levels in 6 games":
    case "Beat 4 levels in 5 games on this card":
    case "Beat 4 levels in 5 games":
    case "Beat 8 levels in 3 games on this card":
    case "Beat 8 levels in 3 games":
      return "/general/matt/LEVEL.png";
    // BOSS/ENEMY
    case "Defeat 2 bosses in 4 games on this card":
    case "Defeat 2 bosses in 4 games":
    case "Defeat 8 bosses from games on this card":
    case "Defeat a boss in 6 games on this card":
    case "Defeat a boss in 6 games":
      return "/general/matt/BOSS.png";
    // THEME
    case "SHOOTER: Beat 5 levels across Elfazar's Hat, Seaside Drive, and Caramel Caramel":
      return "/general/matt/SHOOTER.png";
    case "DAY JOB: Beat 9 levels across Rail Heist, Onion Delivery, and Bug Hunter":
      return "/general/matt/DAYJOB.png";
    case "RACER: Win 12 races across Paint Chase, The Big Bell Race, and Quibble Race":
      return "/general/matt/RACER.png";
    case "PUZZLER: Beat 12 levels across Block Koala, Devilition, and Warptank":
      return "/general/matt/PUZZLER.png";
    case "AMY: Beat 5 levels across Party House, Fist Hell, and Hot Foot, with 1+ in each":
      return "/general/matt/AMY.png";
    case "WAR IS BAD: Win 7 battles across Avianos, Combatants, and Lords of Diskonia":
      return "/general/matt/WARISBAD.png";
    case "METROIDVANIA: Collect 6 abilities across Porgy, Vainger, and Golfaria":
      return "/general/matt/METROIDVANIA.png";
    case "ROLE PLAYER: Level up your highest-level character 5 total times across Grimstone, Divers, Valbrace":
      return "/general/matt/ROLEPLAYER.png";
    case "REVOLUTIONARY: Beat 5 levels across Mortol, Cyber Owls, Rock On! Island":
      return "/general/matt/REVOLUTIONARY.png";
    case "TRADER: Buy or Trade in 7 places across Barbuta, Planet Zoldath, Pilot Quest":
      return "/general/matt/TRADER.png";
    default:
      goal satisfies never;
      return "/general/sprites/IconUnknown.png";
  }
}
