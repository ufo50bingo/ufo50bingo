import classes from "./PlayedGame.module.css";
import PlayedGame from "./PlayedGame";
import SideCell from "./SideCell";
import { Font } from "@/app/font/useFont";
import { ReactNode } from "react";
import { TPlayedGame } from "./PlayedGameState";

type Props = {
  recentGames: ReadonlyArray<TPlayedGame>;
  subcategoryIdToName: ReadonlyMap<number, string>;
  limit: number;
  font: Font;
  gameList: { [game: string]: string };
};

export default function RecentGames({
  recentGames,
  subcategoryIdToName,
  limit,
  font,
  gameList,
}: Props) {
  const result: Array<ReactNode> = [];
  for (
    let index = recentGames.length - 1;
    index >= 0 && result.length < limit;
    index--
  ) {
    result.push(
      <SideCell key={index}>
        <div style={{ width: "60px", height: "68px" }}>
          <PlayedGame
            recentGame={recentGames[index]}
            subcategoryIdToName={subcategoryIdToName}
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
