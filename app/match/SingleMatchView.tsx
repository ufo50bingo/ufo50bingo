import { useMemo } from "react";
import { FullParsedGame } from "../fetchFeed";
import CastBoardWithTrackers from "../room/[id]/cast/CastBoardWithTrackers";
import getGameList from "../room/[id]/common/getGameList";
import usePasta from "../room/[id]/common/usePasta";

type Props = {
  game: FullParsedGame;
};

export default function SingleMatchView({ game }: Props) {
  const pasta = usePasta(game);
  const gameList = useMemo(() => getGameList(pasta), [pasta]);
  const hasStarted = true;
  return (
    <CastBoardWithTrackers
      game={game}
      pasta={pasta}
      countPosition="side_by_side"
      showRecentGames={true}
      generalGoals={generalGoals}
      font="default"
      iconType="sprites"
      players={players}
      areGeneralGoalsHidden={false}
      squareColors={squareColors}
      allPlayerGames={allPlayerGames}
      allMembers={allMembers}
      boardCover={
        hasStarted ? null : (
          <>
            You can view the board after
            <br />
            the match has been started.
          </>
        )
      }
      gameList={gameList}
      gameToGoals={gameToGoals}
      shownDifficulties={shownDifficulties}
      generals={generals}
    />
  );
}
