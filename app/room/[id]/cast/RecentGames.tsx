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
  isNes50: boolean;
};

export default function RecentGames({
  recentGames,
  limit,
  font,
  isNes50,
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
        <PlayedGame
          game={game}
          startTime={startTime}
          endTime={endTime}
          font={font}
          isNes50={isNes50}
        />
      </SideCell>,
    );
  }

  while (result.length < limit) {
    result.push(
      <SideCell key={result.length}>
        <div className={classes.container}>
          <img
            alt="No game"
            src={`/cobwebs/cobwebs${result.length}.png`}
            className={classes.gameIcon}
          />
        </div>
      </SideCell>,
    );
  }
  return <>{result}</>;
}
