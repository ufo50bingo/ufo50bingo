import SquareText from "./SquareText";
import classes from "./Board.module.css";
import {
  CSSProperties,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Difficulty } from "./goals";
import findGoal, { FoundGoal } from "./findGoal";
import { STANDARD_UFO } from "./pastas/standardUfo";
import { SPICY_UFO } from "./pastas/spicyUfo";
import { useRightClickBehaviorContext } from "./settings/RightClickBehaviorContext";
import { useShouldShortenContext } from "./settings/ShouldShortenContext";
import { NES_50_UFO } from "./pastas/nes50Ufo";
import { EVERY_GAME_UFO } from "./pastas/everyGameUfo";
import { useShouldShowRecentContext } from "./settings/ShouldShowRecentContext";
import HeldHandIcon from "./HeldHandIcon";
import { UFOPasta } from "./generator/ufoGenerator";
import {
  BingosyncColor,
  BLANK_SQUARE_CLASS,
  COLOR_INFO,
  getColorSquareClass,
  getColorHex,
} from "./color";

type Props = {
  squareNames: ReadonlyArray<string>;
  squareColors: ReadonlyArray<ReadonlyArray<BingosyncColor>>;
  overlays?: ReadonlyArray<null | ReactNode>;
  highlights?: ReadonlyArray<null | ReadonlyArray<BingosyncColor>>;
  onClickSquare: null | undefined | ((squareIndex: number) => void);
  shownDifficulties: ReadonlyArray<Difficulty>;
  viewerColor: BingosyncColor | null;
  boardCover: ReactNode;
  isPlay?: boolean;
  castInfo?: { leftColor: BingosyncColor; rightColor: BingosyncColor };
  pasta?: null | UFOPasta;
  rows?: number;
  columns?: number;
  maxFontSize?: number;
  minFontSize?: number;
  canShowRecent?: boolean;
};

function getDifficulty(
  foundGoal: FoundGoal<string, string, string>,
  shownDifficulties: ReadonlyArray<Difficulty>,
): null | ReactNode {
  const difficulty = foundGoal.isGeneral ? "general" : foundGoal.category;
  if (!shownDifficulties.includes(difficulty as Difficulty)) {
    return null;
  }
  let difficultyClass;
  let letter;
  switch (difficulty) {
    case "easy":
      difficultyClass = classes.easy;
      letter = "E";
      break;
    case "medium":
      difficultyClass = classes.medium;
      letter = "M";
      break;
    case "hard":
      difficultyClass = classes.hard;
      letter = "H";
      break;
    case "veryhard":
      difficultyClass = classes.veryhard;
      letter = "V";
      break;
    case "general":
      difficultyClass = classes.general;
      letter = "G";
      break;
    default:
      return null;
  }
  return (
    <>
      <div className={`${classes.difficulty} ${difficultyClass}`} />
      <div className={classes.difficultyBorder} />
      <div className={classes.difficultyLetter}>{letter}</div>
    </>
  );
}

function getColorHexOrCustom(color: string): string {
  const info = COLOR_INFO.find((c) => c.key === color);
  if (info != null) {
    return info.hex;
  }
  return color;
}

function getBorderStyles(
  colors: null | undefined | ReadonlyArray<string>,
): undefined | CSSProperties {
  if (colors == null || colors.length < 1) {
    return undefined;
  }
  const topAndLeft = getColorHexOrCustom(colors[0]);
  const bottomAndRight =
    colors.length > 1
      ? getColorHexOrCustom(colors[1])
      : getColorHexOrCustom(colors[0]);

  const boxShadow = `inset 10px 0 10px -10px ${topAndLeft}, inset 0 10px 10px -10px ${topAndLeft}, inset -10px 0 10px -10px ${bottomAndRight}, inset 0 -10px 10px -10px ${bottomAndRight}`;

  return {
    boxShadow,
    borderTopColor: topAndLeft,
    borderLeftColor: topAndLeft,
    borderRightColor: bottomAndRight,
    borderBottomColor: bottomAndRight,
  };
}

// adds diagonal stripes, and tries to give equal area
function getStripeStyles(colors: ReadonlyArray<BingosyncColor>): CSSProperties {
  const stops: Array<string> = [];
  let prevPercent = 0;
  colors.forEach((color, index) => {
    const areaFraction = (index + 1) / colors.length;
    const position =
      areaFraction <= 0.5
        ? Math.sqrt(areaFraction / 2)
        : 1 - Math.sqrt((1 - areaFraction) / 2);
    const percent = position * 100;
    const hex = getColorHex(color);
    stops.push(`${hex} ${prevPercent}%`, `${hex} ${percent}%`);
    prevPercent = percent;
  });
  return {
    backgroundImage: `linear-gradient(to bottom right, ${stops.join(", ")})`,
  };
}

export default function Board({
  squareNames,
  squareColors,
  overlays,
  highlights,
  onClickSquare,
  shownDifficulties,
  viewerColor,
  boardCover,
  castInfo,
  pasta,
  isPlay = false,
  rows = 5,
  columns = 5,
  maxFontSize = 14,
  minFontSize = 9.1,
  canShowRecent = true,
}: Props) {
  const { rightClickBehavior } = useRightClickBehaviorContext();
  const { shouldShortenPlay, shouldShortenCast } = useShouldShortenContext();
  const { shouldShowRecentPlay, shouldShowRecentCast } =
    useShouldShowRecentContext();
  const shouldShowRecent =
    canShowRecent &&
    (castInfo != null
      ? shouldShowRecentCast
      : isPlay
        ? shouldShowRecentPlay
        : false);
  const [rightClickCounts, setRightClickCounts] = useState<
    ReadonlyArray<number | null>
  >(squareNames.map((_) => null));

  const prevSquareColors = useRef(squareColors);
  const [isRecent, setIsRecent] = useState(() => squareNames.map((_) => false));
  useEffect(() => {
    if (!shouldShowRecent) {
      return;
    }
    // A square is recent if someone other than the viewer added or removed
    // a color on it
    const newlyColored = squareColors.map((colors, squareIndex) => {
      const prevColors = prevSquareColors.current[squareIndex] ?? [];
      return [
        ...colors.filter((color) => !prevColors.includes(color)),
        ...prevColors.filter((color) => !colors.includes(color)),
      ].some((color) => color !== viewerColor);
    });

    if (newlyColored.some(Boolean)) {
      setIsRecent((prev) =>
        prev.map((val, squareIndex) => val || newlyColored[squareIndex]),
      );
    }

    prevSquareColors.current = squareColors;
  }, [squareColors, viewerColor, shouldShowRecent]);

  const shouldShorten =
    castInfo != null ? shouldShortenCast : shouldShortenPlay;

  const rightClickHighlights = useMemo(() => {
    if (
      highlights != null ||
      viewerColor == null ||
      rightClickBehavior.length < 1
    ) {
      return null;
    }
    const newHighlights: null | Array<null | ReadonlyArray<string>> = Array(
      rows * columns,
    ).fill(null);
    rightClickCounts.forEach((behaviorIndex, squareIndex) => {
      if (behaviorIndex == null) {
        return;
      }
      const behavior =
        rightClickBehavior[
          Math.min(rightClickBehavior.length - 1, behaviorIndex)
        ];
      if (behavior.type === "custom_color") {
        newHighlights[squareIndex] = [behavior.color];
      } else if (behavior.type === "my_color") {
        newHighlights[squareIndex] = [viewerColor];
      }
    });
    return newHighlights;
  }, [
    columns,
    highlights,
    rightClickBehavior,
    rightClickCounts,
    rows,
    viewerColor,
  ]);
  const resolvedHighlights = highlights ?? rightClickHighlights;
  return (
    <div
      className={classes.boardContainer}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
    >
      {squareNames.map((name, squareIndex) => {
        const foundGoal =
          pasta != null
            ? findGoal(name, pasta)
            : (findGoal(name, STANDARD_UFO) ??
              findGoal(name, SPICY_UFO) ??
              findGoal(name, NES_50_UFO) ??
              findGoal(name, EVERY_GAME_UFO));
        const displayGoal = shouldShorten
          ? (foundGoal?.short?.resolved ?? name)
          : name;
        const colors = squareColors[squareIndex] ?? [];
        const rightClickCount = rightClickCounts[squareIndex];
        const isStarred =
          rightClickCount == null
            ? false
            : rightClickBehavior[
                Math.min(rightClickBehavior.length - 1, rightClickCount)
              ].type === "star";
        let heldColor: BingosyncColor | null = null;
        if (
          castInfo != null &&
          rightClickCount != null &&
          colors.length === 0
        ) {
          const curBehavior =
            rightClickBehavior[
              Math.min(rightClickBehavior.length - 1, rightClickCount)
            ].type;
          if (curBehavior === "left_hold") {
            heldColor = castInfo.leftColor;
          } else if (curBehavior === "right_hold") {
            heldColor = castInfo.rightColor;
          }
        }
        const recentClass =
          isRecent[squareIndex] && shouldShowRecent ? classes.recent : "";
        const colorClass =
          colors.length === 0
            ? BLANK_SQUARE_CLASS
            : colors.length === 1
              ? getColorSquareClass(colors[0])
              : "";
        const style =
          colors.length > 1
            ? getStripeStyles(colors)
            : colors.length === 0 && resolvedHighlights != null
              ? getBorderStyles(resolvedHighlights[squareIndex])
              : undefined;
        return (
          <div
            key={squareIndex}
            className={`${classes.unselectable} ${classes.square} ${recentClass} ${colorClass}`}
            onClick={() => onClickSquare != null && onClickSquare(squareIndex)}
            onAnimationEnd={() => {
              setIsRecent((prev) => {
                const next = [...prev];
                next[squareIndex] = false;
                return next;
              });
            }}
            onContextMenu={(event) => {
              event.preventDefault();
              const oldCount = rightClickCounts[squareIndex];
              const newRightClickCounts = [...rightClickCounts];
              const maxCount = rightClickBehavior.length - 1;
              newRightClickCounts[squareIndex] =
                oldCount == null
                  ? 0
                  : oldCount >= maxCount
                    ? null
                    : oldCount + 1;
              setRightClickCounts(newRightClickCounts);
            }}
            style={style}
          >
            {isStarred && <div className={classes.starred} />}
            {heldColor != null && (
              <>
                <div
                  className={`${classes.held} ${getColorSquareClass(heldColor)}`}
                />
                <HeldHandIcon color={heldColor} className={classes.hand} />
              </>
            )}
            {shownDifficulties.length > 0 &&
              foundGoal != null &&
              getDifficulty(foundGoal, shownDifficulties)}
            <SquareText
              key={displayGoal}
              text={displayGoal}
              horizontalPadding={10}
              verticalPadding={overlays != null ? 30 : 10}
              maxFontSize={maxFontSize}
              minFontSize={minFontSize}
            />
            {overlays != null && overlays[squareIndex] != null && (
              <div className={classes.overlay}>{overlays[squareIndex]}</div>
            )}
          </div>
        );
      })}
      {boardCover}
    </div>
  );
}
