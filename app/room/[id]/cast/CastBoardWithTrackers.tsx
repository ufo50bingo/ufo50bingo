import Board from "@/app/Board";
import StandardBoardWrapper from "@/app/StandardBoardWrapper";
import { Group } from "@mantine/core";
import ScoreSquare from "../common/ScoreSquare";
import { GeneralItem } from "./Cast";
import GeneralIcons from "./GeneralIcons";
import RecentGames from "./RecentGames";
import SideCell from "./SideCell";
import SideColumn from "./SideColumn";
import { Font } from "@/app/font/useFont";
import { IconType } from "./useLocalState";
import { GenericMember, PlayerMember } from "../common/useMembers";
import { ReactNode, useMemo } from "react";
import { FullParsedGame } from "@/app/fetchFeed";
import { GameToGoals } from "./findAllGames";
import { UFOPasta } from "@/app/generator/ufoGenerator";
import { Difficulty } from "@/app/goals";
import { GeneralCounts } from "./CastPage";
import { BingosyncColor } from "@/app/color";
import BoardState from "@/app/match/[id]/BoardState";
import PlayedGameState from "./PlayedGameState";
import { TCountPosition } from "./useCountPosition";

type Props = {
  game: FullParsedGame;
  pasta: null | UFOPasta;
  countPosition: TCountPosition;
  showRecentGames: boolean;
  generalGoals: ReadonlyArray<GeneralItem>;
  font: Font;
  iconType: IconType;
  players: ReadonlyArray<PlayerMember>;
  areGeneralGoalsHidden: boolean;
  boardState: BoardState;
  allMembers: ReadonlyMap<number, GenericMember>;
  boardCover: ReactNode;
  gameList: { [game: string]: string };
  gameToGoals: GameToGoals;
  shownDifficulties: ReadonlyArray<Difficulty>;
  generals: GeneralCounts;
  onClickSquare?: (squareIndex: number) => unknown;
  subcategoryIdToName: ReadonlyMap<number, string>;
  playedGameState: PlayedGameState;
  tiebreakWinner: null | BingosyncColor;
  canShowRecent?: boolean;
  overlays?: ReadonlyArray<null | ReactNode>;
  canShrink?: boolean;
  showSideColumns?: boolean;
};

export default function CastBoardWithTrackers({
  game,
  pasta,
  countPosition,
  showRecentGames,
  generalGoals,
  font,
  iconType,
  players,
  areGeneralGoalsHidden,
  boardState,
  allMembers,
  boardCover,
  gameList,
  gameToGoals,
  shownDifficulties,
  generals,
  onClickSquare,
  subcategoryIdToName,
  playedGameState,
  tiebreakWinner,
  canShowRecent = true,
  overlays,
  canShrink = false,
  showSideColumns = true,
}: Props) {
  const leftPlayer: null | undefined | PlayerMember = players[0];
  const rightPlayer: null | undefined | PlayerMember = players[1];

  const leftColor = leftPlayer?.color ?? "red";
  const rightColor = rightPlayer?.color ?? "red";

  const squareColors = useMemo(
    () => boardState.squares.map((colors) => [...colors]),
    [boardState],
  );
  const scores = boardState.getScores();
  const leftScore = scores.get(leftColor) ?? 0;
  const rightScore = scores.get(rightColor) ?? 0;

  const leftGames =
    leftPlayer != null ? playedGameState.getPlayedGames(leftPlayer.userId) : [];
  const rightGames =
    rightPlayer != null
      ? playedGameState.getPlayedGames(rightPlayer.userId)
      : [];
  const isDouble = generalGoals.length > 0 && countPosition === "side_by_side";

  const boardSize = game.game.rows * game.game.cols;
  const squareNames = useMemo(
    () => game.squares.map((square) => square.name),
    [game.squares],
  );

  const highlights = useMemo(() => {
    const highlights: Array<Array<BingosyncColor>> = Array(boardSize)
      .fill(null)
      .map((_) => []);
    for (const { userId, subcategoryId } of playedGameState.getAllActiveIds()) {
      const subcategoryName = subcategoryIdToName.get(subcategoryId);
      if (subcategoryName != null) {
        const color = allMembers.get(userId)?.color ?? "red";
        for (const [_, index] of gameToGoals[subcategoryName] ?? []) {
          if (!highlights[index].includes(color)) {
            highlights[index].push(color);
          }
        }
      }
    }
    return highlights;
  }, [
    boardSize,
    playedGameState,
    subcategoryIdToName,
    allMembers,
    gameToGoals,
  ]);
  return (
    <Group
      gap={0}
      wrap="nowrap"
      style={canShrink ? { minWidth: 0 } : undefined}
    >
      {showSideColumns && showRecentGames && generalGoals.length > 0 && (
        <SideColumn isDouble={false} rows={game.game.rows}>
          <RecentGames
            limit={game.game.rows + 1}
            recentGames={leftGames}
            subcategoryIdToName={subcategoryIdToName}
            font={font}
            gameList={gameList}
          />
        </SideColumn>
      )}
      {showSideColumns && (
        <SideColumn isDouble={isDouble} rows={game.game.rows}>
          <SideCell>
            <ScoreSquare
              color={leftColor}
              score={leftScore}
              hasTiebreaker={tiebreakWinner === leftColor}
              isDouble={isDouble}
              font={font}
            />
          </SideCell>
          <GeneralIcons
            playerId={leftPlayer?.userId}
            isLeft={true}
            color={leftColor}
            generalGoals={generalGoals}
            generalState={generals}
            iconType={iconType}
            isHidden={areGeneralGoalsHidden}
            countPosition={countPosition}
            font={font}
            boardState={boardState}
          />
          {showRecentGames && generalGoals.length === 0 && (
            <RecentGames
              limit={game.game.rows}
              recentGames={leftGames}
              subcategoryIdToName={subcategoryIdToName}
              font={font}
              gameList={gameList}
            />
          )}
        </SideColumn>
      )}
      <StandardBoardWrapper
        rows={game.game.rows}
        columns={game.game.cols}
        minSquareWidth={canShrink ? 84 : 105}
      >
        <Board
          pasta={pasta}
          squareNames={squareNames}
          squareColors={squareColors}
          highlights={highlights}
          onClickSquare={onClickSquare}
          boardCover={boardCover}
          shownDifficulties={shownDifficulties}
          viewerColor={null}
          castInfo={{ leftColor, rightColor }}
          canShowRecent={canShowRecent}
          overlays={overlays}
          rows={game.game.rows}
          columns={game.game.cols}
        />
      </StandardBoardWrapper>
      {showSideColumns && (
        <SideColumn isDouble={isDouble} rows={game.game.rows}>
          <SideCell>
            <ScoreSquare
              color={rightColor}
              score={rightScore}
              hasTiebreaker={tiebreakWinner === rightColor}
              isDouble={isDouble}
              font={font}
            />
          </SideCell>
          <GeneralIcons
            isLeft={false}
            playerId={rightPlayer?.userId}
            color={rightColor}
            generalGoals={generalGoals}
            generalState={generals}
            iconType={iconType}
            isHidden={areGeneralGoalsHidden}
            countPosition={countPosition}
            font={font}
            boardState={boardState}
          />
          {showRecentGames && generalGoals.length === 0 && (
            <RecentGames
              limit={game.game.rows}
              recentGames={rightGames}
              subcategoryIdToName={subcategoryIdToName}
              font={font}
              gameList={gameList}
            />
          )}
        </SideColumn>
      )}
      {showSideColumns && showRecentGames && generalGoals.length > 0 && (
        <SideColumn isDouble={false} rows={game.game.rows}>
          <RecentGames
            limit={game.game.rows + 1}
            recentGames={rightGames}
            subcategoryIdToName={subcategoryIdToName}
            font={font}
            gameList={gameList}
          />
        </SideColumn>
      )}
    </Group>
  );
}
