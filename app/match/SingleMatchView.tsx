import { Fragment, useMemo } from "react";
import { FullParsedGame } from "../fetchFeed";
import CastBoardWithTrackers from "../room/[id]/cast/CastBoardWithTrackers";
import getGameList from "../room/[id]/common/getGameList";
import usePasta from "../room/[id]/common/usePasta";
import useGeneralGoals from "../room/[id]/common/useGeneralGoals";
import useMembers from "../room/[id]/common/useMembers";
import useAllPlayerGames from "../room/[id]/cast/useAllPlayerGames";
import { getGameToGoals } from "../room/[id]/cast/findAllGames";
import useGeneralCounts from "../room/[id]/cast/useGeneralCounts";
import useSquareColors from "../room/[id]/common/useSquareColors";
import useGetScore from "../matches/useGetScore";
import useTeams from "../matches/useTeams";
import { Stack } from "@mantine/core";
import TeamPlayers from "../matches/TeamPlayers";
import TeamScoreCell from "../matches/TeamScoreCell";
import classes from "@/app/matches/MatchRow.module.css";

type Props = {
  game: FullParsedGame;
};

export default function SingleMatchView({ game }: Props) {
  const pasta = usePasta(game);
  const squareNames = useMemo(
    () => game.squares.map((s) => s.name),
    [game.squares],
  );
  const gameList = useMemo(() => getGameList(pasta), [pasta]);
  const generalGoals = useGeneralGoals(pasta, squareNames);
  const gameToGoals = useMemo(
    () => getGameToGoals(squareNames, Object.keys(gameList), pasta),
    [squareNames, gameList, pasta],
  );
  // TODO: figure out what to do with casters
  const { players, casters: _casters, allMembers } = useMembers(game.feed);
  const teams = useTeams(players);
  // TODO: fill in real value
  const hasStarted = true;

  // TODO: update these based on time slider
  const allPlayerGames = useAllPlayerGames(game.feed, game.subcategories);
  const generals = useGeneralCounts(
    game.feed,
    game.squares,
    game.subcategories,
  );
  // TODO: support non-lockout
  const squareColors = useSquareColors(
    game.feed,
    game.game.width * game.game.height,
    true,
  );
  const getScore = useGetScore(squareColors);
  // TODO: check whether this is the final result
  const isFinal = false;
  return (
    <Stack>
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
        shownDifficulties={["easy", "veryhard", "general"]}
        generals={generals}
      />
      <Stack gap={4}>
        <div className={classes.teams} style={{ maxWidth: "360px" }}>
          {teams.map((team) => {
            return (
              <Fragment key={team.color}>
                <TeamPlayers
                  team={team}
                  // TODO: isWinner
                  isWinner={false}
                  isVisible={isFinal}
                  size="lg"
                />
                {teams.length > 2 ? (
                  <TeamScoreCell
                    getScore={getScore}
                    team={team}
                    // TODO: winType
                    winType="Bingo"
                    size="lg"
                  />
                ) : (
                  // TODO: show win icon if not showing score??
                  <div />
                )}
              </Fragment>
            );
          })}
        </div>
      </Stack>
    </Stack>
  );
}
