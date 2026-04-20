import { ProperGame } from "@/app/goals";
import classes from "./PlayedGame.module.css";
import RunningDuration from "@/app/practice/RunningDuration";
import Duration from "@/app/practice/Duration";
import { Font } from "@/app/font/useFont";
import getFontClassname from "@/app/font/getFontClassname";
import { useServerOffsetContext } from "../ServerOffsetContext";

type Props = {
  game: ProperGame;
  startTime: number;
  endTime: null | undefined | number;
  font: Font;
};

export default function PlayedGame({ game, startTime, endTime, font }: Props) {
  const { getClientMsFromServerMs } = useServerOffsetContext();
  return (
    <div className={classes.container}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={game} src={`/games/${game}.png`} className={classes.gameIcon} />
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
