import classes from "./PlayedGame.module.css";
import RunningDuration from "@/app/practice/RunningDuration";
import Duration from "@/app/practice/Duration";
import { Font } from "@/app/font/useFont";
import getFontClassname from "@/app/font/getFontClassname";
import { useServerOffsetContext } from "../ServerOffsetContext";
import { TPlayedGame } from "./PlayedGameState";

type Props = {
  recentGame: TPlayedGame;
  subcategoryIdToName: ReadonlyMap<number, string>;
  font: Font;
  gameList: { [game: string]: string };
};

export default function PlayedGame({
  recentGame,
  subcategoryIdToName,
  font,
  gameList,
}: Props) {
  const { getClientMsFromServerMs } = useServerOffsetContext();
  const game = subcategoryIdToName.get(recentGame.subcategoryId);
  const href = game != null ? gameList[game] : null;
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
          {recentGame.type === "running" ? (
            <RunningDuration
              curStartTime={getClientMsFromServerMs(
                recentGame.effectiveStartTime * 1000,
              )}
              accumulatedDuration={0}
              minDuration={recentGame.minDuration * 1000}
              showDecimal={false}
            />
          ) : (
            <Duration
              duration={recentGame.duration * 1000}
              showDecimal={false}
            />
          )}
        </span>
      </div>
    </div>
  );
}
