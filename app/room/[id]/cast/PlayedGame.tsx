import { ProperGame } from "@/app/goals";
import classes from "./PlayedGame.module.css";
import RunningDuration from "@/app/practice/RunningDuration";
import Duration from "@/app/practice/Duration";

type Props = {
  game: ProperGame;
  startTime: number;
  endTime: null | undefined | number;
};

export default function PlayedGame({ game, startTime, endTime }: Props) {
  return (
    <div className={classes.container}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={game} src={`/games/${game}.png`} className={classes.gameIcon} />
      <div className={classes.tag}>
        {endTime == null ? (
          <RunningDuration
            curStartTime={startTime}
            accumulatedDuration={0}
            showDecimal={false}
          />
        ) : (
          <Duration duration={endTime - startTime} showDecimal={false} />
        )}
      </div>
    </div>
  );
}
