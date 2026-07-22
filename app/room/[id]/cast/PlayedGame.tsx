import classes from "./PlayedGame.module.css";
import RunningDuration from "@/app/practice/RunningDuration";
import Duration from "@/app/practice/Duration";
import { Font } from "@/app/font/useFont";
import getFontClassname from "@/app/font/getFontClassname";
import { useServerOffsetContext } from "../ServerOffsetContext";
import { ORDERED_PROPER_GAMES, ProperGame } from "@/app/goals";

type Props = {
  game: string;
  startTime: number;
  endTime: null | undefined | number;
  font: Font;
  isNes50: boolean;
};

export default function PlayedGame({ game, startTime, endTime, font, isNes50 }: Props) {
  const { getClientMsFromServerMs } = useServerOffsetContext();
  const href = isNes50 ? `/nes50boxart/${encodeURIComponent(game)}.png` : ORDERED_PROPER_GAMES.includes(game as ProperGame)
    ? `/games/${game}.png`
    : `/cobwebs/cobwebs0.png`;
  return (
    <div className={classes.container}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={game} src={href} className={classes.gameIcon} />
      <div className={classes.tag}>
        <span className={getFontClassname(font)}>
          {endTime == null ? (
            <RunningDuration
              curStartTime={getClientMsFromServerMs(startTime)}
              accumulatedDuration={0}
              showDecimal={false}
            />
          ) : (
            <Duration duration={endTime - startTime} showDecimal={false} />
          )}
        </span>
      </div>
    </div>
  );
}
