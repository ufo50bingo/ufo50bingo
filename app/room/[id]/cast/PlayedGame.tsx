import classes from "./PlayedGame.module.css";
import RunningDuration from "@/app/practice/RunningDuration";
import Duration from "@/app/practice/Duration";
import { Font } from "@/app/font/useFont";
import getFontClassname from "@/app/font/getFontClassname";
import { useServerOffsetContext } from "../ServerOffsetContext";

type Props = {
  game: string;
  startTime: number;
  endTime: null | undefined | number;
  font: Font;
  gameList: { [game: string]: string };
};

export default function PlayedGame({
  game,
  startTime,
  endTime,
  font,
  gameList,
}: Props) {
  const { getClientMsFromServerMs } = useServerOffsetContext();
  const href = gameList[game];
  return (
    <div className={classes.container}>
      {href != null && href !== "" ? (
        <img
          alt={game}
          src={href == null || href === "" ? undefined : href}
          className={classes.gameIcon}
        />
      ) : (
        <div className={classes.gameIcon}>{game}</div>
      )}
      <div className={classes.tag}>
        <span className={getFontClassname(font)}>
          {endTime == null ? (
            <RunningDuration
              curStartTime={getClientMsFromServerMs(startTime * 1000)}
              accumulatedDuration={0}
              showDecimal={false}
            />
          ) : (
            <Duration
              duration={(endTime - startTime) * 1000}
              showDecimal={false}
            />
          )}
        </span>
      </div>
    </div>
  );
}
