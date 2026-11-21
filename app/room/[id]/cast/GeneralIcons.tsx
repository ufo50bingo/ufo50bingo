import classes from "./GeneralIcons.module.css";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { IconType } from "./useLocalState";
import { GeneralCounts } from "./CastPage";
import SideCell from "./SideCell";
import { GeneralItem } from "./Cast";
import { StandardGeneral } from "@/app/pastas/pastaTypes";
import { Group } from "@mantine/core";
import { Font } from "@/app/font/useFont";
import getFontClassname from "@/app/font/getFontClassname";
import { BingosyncColor } from "@/app/color";
import BoardState from "@/app/match/[id]/BoardState";
import { TCountPosition } from "./useCountPosition";
import GeneralIcon from "./GeneralIcon";
import { FoundGoalWithCast } from "@/app/findGoal";

type IconProps = {
  foundGoal: FoundGoalWithCast<string, string, string>;
  iconType: string;
  isHidden: boolean;
  isLeft: boolean;
  color: BingosyncColor;
  markedSquareColors: ReadonlySet<BingosyncColor>;
  isLockout: boolean;
  count: number;
  countPosition: TCountPosition;
  font: Font;
};

function Icon({
  foundGoal,
  iconType,
  isHidden,
  count,
  color,
  markedSquareColors,
  isLockout,
  countPosition,
  isLeft,
  font,
}: IconProps) {
  const isCompleted = markedSquareColors.has(color);
  // in a non-lockout game we don't want to gray out this general
  // if another team has completed it
  const isOpponentClaimed =
    isLockout && !isCompleted && markedSquareColors.size > 0;

  const countInfo =
    countPosition === "inset"
      ? { hasCheck: isCompleted, count, font }
      : undefined;

  const icon = (
    <GeneralIcon
      foundGoal={foundGoal}
      iconType={iconType}
      isHidden={isHidden}
      isGray={isCompleted || isOpponentClaimed}
      countInfo={countInfo}
    />
  );

  if (countPosition === "inset") {
    return <SideCell>{icon}</SideCell>;
  }
  const tag = isCompleted ? (
    font === "ufo50" ? (
      <img className={classes.bigCheck} src="/elf_check.png" alt="checkmark" />
    ) : (
      <IconCircleCheckFilled color="green" size={30} />
    )
  ) : (
    <div
      className={`${classes.sideBySideTag} ${isOpponentClaimed ? classes.opponentClaimed : ""}`}
    >
      <span className={getFontClassname(font, false, count > 9)}>{count}</span>
    </div>
  );
  return (
    <SideCell>
      <Group gap={8}>
        {isLeft ? (
          <>
            {icon}
            {tag}
          </>
        ) : (
          <>
            {tag}
            {icon}
          </>
        )}
      </Group>
    </SideCell>
  );
}

type Props = {
  color: BingosyncColor;
  generalGoals: ReadonlyArray<GeneralItem>;
  generalState: GeneralCounts;
  playerId: null | undefined | number;
  isLeft: boolean;
  iconType: IconType;
  isHidden: boolean;
  countPosition: TCountPosition;
  font: Font;
  boardState: BoardState;
};

export default function GeneralIcons({
  color,
  generalGoals,
  generalState,
  playerId,
  isLeft,
  iconType,
  isHidden,
  countPosition,
  font,
  boardState,
}: Props) {
  return generalGoals.map((item) => {
    const { resolvedGoal } = item.foundGoal;
    const countState =
      playerId != null ? generalState[resolvedGoal]?.[playerId] : null;
    return (
      <Icon
        key={resolvedGoal}
        foundGoal={item.foundGoal}
        iconType={iconType}
        isHidden={isHidden}
        color={color}
        markedSquareColors={boardState.squares[item.squareIndex]}
        isLockout={boardState.isLockout}
        count={
          countState == null
            ? 0
            : Object.keys(countState).reduce(
                (acc, game) => acc + countState[game],
                0,
              )
        }
        countPosition={countPosition}
        isLeft={isLeft}
        font={font}
      />
    );
  });
}
