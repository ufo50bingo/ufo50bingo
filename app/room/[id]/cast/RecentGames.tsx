import classes from "./PlayedGame.module.css";
import PlayedGame from "./PlayedGame";
import SideCell from "./SideCell";
import { CurrentGame } from "./useSyncedState";
import { Font } from "@/app/font/useFont";
import { ReactNode } from "react";

type Props = {
  recentGames: ReadonlyArray<CurrentGame>;
  limit: number;
  font: Font;
  gameList: { [game: string]: string };
};

export default function RecentGames({
  recentGames,
  limit,
  font,
  gameList,
}: Props) {
  const filtered = recentGames.filter((recentGame, index) => {
    const prevGame = index > 0 ? recentGames[index - 1] : null;
    // TODO: make sure we're getting null instead of undefined for no game selected
    // and remove the ?? null
    return (
      prevGame == null || (recentGame.game ?? null) !== (prevGame.game ?? null)
    );
  });
  const result: Array<ReactNode> = [];
  for (
    let index = filtered.length - 1;
    index >= 0 && result.length < limit;
    index--
  ) {
    const { game, start_time: startTime } = filtered[index];
    if (game == null) {
      continue;
    }
    const endTime =
      index === filtered.length - 1 ? null : filtered[index + 1].start_time;
    result.push(
      <SideCell key={startTime}>
        <div style={{ width: "60px", height: "68px" }}>
          <PlayedGame
            game={game}
            startTime={startTime}
            endTime={endTime}
            font={font}
            gameList={gameList}
          />
        </div>
      </SideCell>,
    );
  }

  while (result.length < limit) {
    result.push(
      <SideCell key={result.length}>
        <div style={{ width: "60px", height: "68px" }}>
          <div className={classes.container}>
            <img
              alt="No game"
              src={`/cobwebs/cobwebs${result.length}.png`}
              className={classes.gameIcon}
            />
          </div>
        </div>
      </SideCell>,
    );
  }
  return <>{result}</>;
}
