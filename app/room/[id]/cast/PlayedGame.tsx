import classes from "./PlayedGame.module.css";
import { LayoutFont } from "@/app/font/useFont";
import getFontClassname from "@/app/font/getFontClassname";
import { TPlayedGame } from "./PlayedGameState";
import PlayedGameDuration from "./PlayedGameDuration";

type Props = {
  recentGame: TPlayedGame;
  subcategoryIdToName: ReadonlyMap<number, string>;
  font: LayoutFont;
  gameList: { [game: string]: string };
  showTimer: boolean;
};

export default function PlayedGame({
  recentGame,
  subcategoryIdToName,
  font,
  gameList,
  showTimer,
}: Props) {
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
      {showTimer && (
        <div className={classes.tag}>
          <span className={getFontClassname(font)}>
            <PlayedGameDuration recentGame={recentGame} />
          </span>
        </div>
      )}
    </div>
  );
}
