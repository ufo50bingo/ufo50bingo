import { Fragment, useMemo } from "react";
import { FullParsedGame } from "../fetchFeed";
import CastBoardWithTrackers from "../room/[id]/cast/CastBoardWithTrackers";
import getGameList from "../room/[id]/common/getGameList";
import usePasta from "../room/[id]/common/usePasta";
import useGeneralGoals from "../room/[id]/common/useGeneralGoals";
import useMembers from "../room/[id]/common/useMembers";
import { getGameToGoals } from "../room/[id]/cast/findAllGames";
import useGeneralCounts from "../room/[id]/cast/useGeneralCounts";
import useSquareColors from "../room/[id]/common/useSquareColors";
import useTeams from "../matches/useTeams";
import { Stack } from "@mantine/core";
import TeamPlayers from "../matches/TeamPlayers";
import TeamScoreCell from "../matches/TeamScoreCell";
import classes from "@/app/matches/MatchRow.module.css";
import useTeamsWithResults from "../matches/useTeamsWithResults";
import getFeedWithoutMistakes from "./[id]/getFeedWithoutMistakes";
import PlayedGameState from "../room/[id]/cast/PlayedGameState";

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
  const teamsMap = useTeams(players);
  const boardStateParams = useMemo(
    () => ({
      rows: game.game.rows,
      cols: game.game.cols,
      isLockout: game.game.isLockout,
    }),
    [game.game.cols, game.game.isLockout, game.game.rows],
  );
  const feedWithoutMistakes = useMemo(
    () => getFeedWithoutMistakes(game.feed, boardStateParams),
    [boardStateParams, game.feed],
  );
  const teamsWithResults = useTeamsWithResults(
    teamsMap,
    feedWithoutMistakes,
    boardStateParams,
  );
  const hasWinner =
    teamsWithResults.length > 0 && teamsWithResults[0].winType != null;
  // TODO: fill in real value
  const hasStarted = true;

  const subcategoryIdToName = useMemo(
    () => new Map(game.subcategories.map((sc) => [sc.subcategoryId, sc.name])),
    [game.subcategories],
  );
  const playedGameState = useMemo(
    () => PlayedGameState.fromFeed(game.feed),
    [game.feed],
  );
  const generals = useGeneralCounts(
    game.feed,
    game.squares,
    game.subcategories,
  );
  // TODO: support non-lockout
  const squareColors = useSquareColors(
    game.feed,
    game.game.rows * game.game.cols,
    true,
  );
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
        playedGameState={playedGameState}
        subcategoryIdToName={subcategoryIdToName}
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
      {/* TODO: space-between if only two teams? */}
      <Stack gap={4}>
        <div className={classes.teams} style={{ maxWidth: "360px" }}>
          {teamsWithResults.map((team) => {
            return (
              <Fragment key={team.color}>
                <TeamPlayers
                  team={team}
                  isWinner={team.winType != null}
                  isWinnerShown={isFinal && hasWinner}
                  size="lg"
                />
                {teamsWithResults.length > 2 ? (
                  <TeamScoreCell team={team} size="lg" />
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
