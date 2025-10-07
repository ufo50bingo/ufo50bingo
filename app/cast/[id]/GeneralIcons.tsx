import { ReactNode } from "react";

import classes from "./GeneralIcons.module.css";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { BingosyncColor, Square } from "@/app/matches/parseBingosyncData";
import { Generals } from "./useCasterState";
import { getColorClass } from "@/app/matches/BingosyncColored";
import { GoalName } from "@/app/goals";

function Cell({ children }: { children: ReactNode }) {
    return (
        <div className={classes.item}>
            {children}
        </div>
    );
}

type IconProps = {
    goal: string;
    color: BingosyncColor;
    squareColor: BingosyncColor;
    src: string;
    count: number;
};

function Icon({ goal, src, count, color, squareColor }: IconProps) {
    const imgClass = squareColor !== 'blank' && color !== squareColor ? `${classes.icon} ${classes.grayscale}` : classes.icon;
    const tag = squareColor === color
        ? <IconCircleCheckFilled className={classes.tagPosition} color="green" size={24} />
        : <div className={classes.tag}>{count}</div>;
    return (
        <Cell>
            <img className={imgClass} src={src} alt={goal} />
            {tag}
        </Cell>
    );
}

type Props = {
    color: BingosyncColor;
    score: number;
    generalGoals: ReadonlyArray<Square>;
    generalState: Generals;
    isLeft: boolean;
};

export default function GeneralIcons({ color, score, generalGoals, generalState, isLeft }: Props) {
    return (
        <div className={classes.container}>
            <Cell><span className={`${classes.score} ${getColorClass(color)}`}>{score}</span></Cell>
            {generalGoals.map(square => {
                const checkState = isLeft
                    ? generalState[square.name]?.leftChecked
                    : generalState[square.name]?.rightChecked;
                return (
                    <Icon
                        key={square.name}
                        goal={square.name}
                        color={color}
                        squareColor={square.color}
                        count={checkState?.size ?? 0}
                        src={getIconSrc(square.name as GoalName) ?? ''}
                    />
                );
            })}
        </div>
    )
}

function getIconSrc(goal: GoalName): null | string {
    switch (goal) {
        case "Collect 2 cherry disks from games on this card":
        case "Collect 3 cherry disks from games on this card":
            return '/general/IconCherry.png';
        case "Collect 3 gold disks from games on this card":
        case "Collect 4 gold disks from games on this card":
            return '/general/IconGold.png';
        case "Collect 6 gifts from games on this card":
        case "Collect 7 gifts from games on this card":
        case "Collect 8 gifts from games on this card":
            return '/general/IconGarden.png'
        case "ARCADE ACE: Gold Disk any 3 of the 16 “ARCADE” games":
            return '/general/IconAce.png';
        case "TRIATHLON: Gold Disk any 3 of the 5 “SPORT” games":
            return '/general/IconTriathlon.png';
        case "Collect a beverage in 6 games":
            return '/general/IconBev.png';
        case "Collect a food item in 8 games":
            return '/general/IconFood.png';
        case "Beat 2 levels in 8 different games":
        case "Beat 4 levels in 5 different games":
        case "Beat 8 levels in 3 different games":
            return '/general/IconLevel.png';
        case "Collect a key in 7 games":
            return '/general/IconKey.png';
        case "Open 2 chests in 5 games":
            return '/general/IconChest.png';
        case "Buy an item from a shop in 10 games":
            return '/general/IconShops.png';
        case "Find an easter egg UFO in 5 games":
            return '/general/IconUfo.png';
        case "Earn an extra life/1UP in 8 games":
            return '/general/Icon1up.png';
        case "Find an egg in 10 games":
            return '/general/IconEgg.png';
        case "Increase your base HP in 6 games":
            return '/general/IconHealth.png';
        case "Defeat 2 bosses in 4 different games":
        case "Defeat 7 bosses":
        case "Defeat a boss in 6 different games":
            return '/general/IconBoss.png';
        case "Enter a top 3 score on 2 arcade leaderboards":
        case "Enter a top 3 score on 3 arcade leaderboards":
        case "Enter a top 5 score on 4 arcade leaderboards":
            return '/general/IconLeaderboard.png';
        case "PILOT PARTY: Collect 4 gifts: Campanella 1/2/3, Planet Zoldath, Pilot Quest, The Big Bell Race":
            return '/general/IconPilot.png';
        case "ALPHA TRILOGY: Gold Velgress, Overbold, and Quibble Race as Alpha":
            return '/general/IconAlpha.png';
        case "AMY: Playing as Amy, beat 1 level in Party House, 2 in Hot Foot, 2 in Fist Hell":
            return '/general/IconAmy.png';
        case "CAMPANELLA TRILOGY: Beat two worlds in Campanella, two in Campanella 2, one in Campanella 3":
            return '/general/IconCampTrilogy.png';
        case "DAY JOB: Beat 1 level in Bug Hunter, 2 in Onion Delivery, 3 in Rail Heist":
            return '/general/IconDayJob.png';
        case "METROIDVANIA: Collect Abilities: 3 in Porgy, 2 in Vainger, 1 in Golfaria":
            return '/general/IconMetroidvania.png';
        case "PUZZLER: Beat 5 levels in Block Koala, Camouflage, Warptank":
            return '/general/IconPuzzler.png';
        case "RACER: Win 4 races in Paint Chase, The Big Bell Race, Quibble Race":
            return '/general/IconRacer.png';
        case "ROLE-PLAYER: Level up all your characters twice in Divers, Valbrace, Grimstone":
            return '/general/IconRolePlayer.png';
        case "WAR IS BAD: Win 3 battles in Attactics, Avianos, Combatants":
            return '/general/IconWarIsBad.png';
        default:
            return null;
    }
}