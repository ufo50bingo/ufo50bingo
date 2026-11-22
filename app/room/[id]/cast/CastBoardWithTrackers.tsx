import Board from "@/app/Board";
import StandardBoardWrapper from "@/app/StandardBoardWrapper";
import { Group } from "@mantine/core";
import ScoreSquare from "../common/ScoreSquare";
import { GeneralItem, TCountPosition } from "./Cast";
import GeneralIcons from "./GeneralIcons";
import RecentGames from "./RecentGames";
import SideCell from "./SideCell";
import SideColumn from "./SideColumn";
import { Font } from "@/app/font/useFont";
import { IconType } from "./useLocalState";
import { GenericMember, PlayerMember } from "../common/useMembers";
import { AllPlayerGames } from "./useSyncedState";
import { ReactNode, useMemo } from "react";
import { FullParsedGame } from "@/app/fetchFeed";
import { GameToGoals } from "./findAllGames";
import { UFOPasta } from "@/app/generator/ufoGenerator";
import { Difficulty } from "@/app/goals";
import { GeneralCounts } from "./CastPage";
import { BingosyncColor } from "@/app/color";

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
  squareColors: ReadonlyArray<ReadonlyArray<BingosyncColor>>;
  allPlayerGames: AllPlayerGames;
  allMembers: ReadonlyMap<number, GenericMember>;
  boardCover: ReactNode;
  gameList: { [game: string]: string };
  gameToGoals: GameToGoals;
  shownDifficulties: ReadonlyArray<Difficulty>;
  generals: GeneralCounts;
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
  squareColors,
  allPlayerGames,
  allMembers,
  boardCover,
  gameList,
  gameToGoals,
  shownDifficulties,
  generals,
}: Props) {
  const leftPlayer: null | undefined | PlayerMember = players[0];
  const rightPlayer: null | undefined | PlayerMember = players[1];

  const leftColor = leftPlayer?.color ?? "red";
  const rightColor = rightPlayer?.color ?? "red";

  const leftScore = squareColors.filter((colors) =>
    colors.includes(leftColor),
  ).length;
  const rightScore = squareColors.filter((colors) =>
    colors.includes(rightColor),
  ).length;
  const tiebreakWinner = null;
  // const tiebreakWinner = useMemo<BingosyncColor | null>(() => {
  //   try {
  //     if (
  //       leftScore !== rightScore ||
  //       leftColor === rightColor ||
  //       leftScore === 0
  //     ) {
  //       return null;
  //     }
  //     const changelog = getChangelog(rawFeed);
  //     const result = getResult(board, changelog.changes, null, null);
  //     if (result == null) {
  //       return null;
  //     }
  //     const isValid =
  //       result.winnerScore === leftScore &&
  //       result.opponentScore === leftScore &&
  //       (result.winnerColor === leftColor ||
  //         result.winnerColor === rightColor) &&
  //       (result.opponentColor === leftColor ||
  //         result.opponentColor === rightColor);
  //     if (!isValid) {
  //       return null;
  //     }
  //     return result.winnerColor as BingosyncColor;
  //   } catch {
  //     return null;
  //   }
  // }, [leftScore, rightScore, leftColor, rightColor, rawFeed, board]);

  const leftGames =
    leftPlayer != null ? (allPlayerGames.get(leftPlayer.userId) ?? []) : [];
  const rightGames =
    rightPlayer != null ? (allPlayerGames.get(rightPlayer.userId) ?? []) : [];
  const isDouble = generalGoals.length > 0 && countPosition === "side_by_side";

  const boardSize = game.game.rows * game.game.cols;

  const highlights = useMemo(() => {
    const highlights: Array<Array<BingosyncColor>> = Array(boardSize)
      .fill(null)
      .map((_) => []);
    for (const [userId, currentGames] of allPlayerGames.entries()) {
      const currentGame =
        currentGames.length > 0
          ? currentGames[currentGames.length - 1].game
          : null;
      if (currentGame != null) {
        const color = allMembers.get(userId)?.color ?? "red";
        for (const [_, index] of gameToGoals[currentGame] ?? []) {
          if (!highlights[index].includes(color)) {
            highlights[index].push(color);
          }
        }
      }
    }
    return highlights;
  }, [boardSize, allPlayerGames, allMembers, gameToGoals]);
  return (
    <Group gap={0}>
      {showRecentGames && generalGoals.length > 0 && (
        <SideColumn isDouble={false}>
          <RecentGames
            limit={6}
            recentGames={leftGames}
            font={font}
            gameList={gameList}
          />
        </SideColumn>
      )}
      <SideColumn isDouble={isDouble}>
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
          squareColors={squareColors}
        />
        {showRecentGames && generalGoals.length === 0 && (
          <RecentGames
            limit={5}
            recentGames={leftGames}
            font={font}
            gameList={gameList}
          />
        )}
      </SideColumn>
      <StandardBoardWrapper rows={game.game.rows} columns={game.game.cols}>
        <Board
          pasta={pasta}
          board={squareColors.map((colors, index) => ({
            name: game.squares[index].name,
            color: colors.length > 0 ? colors[0] : null,
          }))}
          highlights={highlights}
          onClickSquare={(_newIndex: number) => {}}
          boardCover={boardCover}
          shownDifficulties={shownDifficulties}
          viewerColor={null}
          castInfo={{ leftColor, rightColor }}
          rows={game.game.rows}
          columns={game.game.cols}
        />
      </StandardBoardWrapper>
      <SideColumn isDouble={isDouble}>
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
          squareColors={squareColors}
        />
        {showRecentGames && generalGoals.length === 0 && (
          <RecentGames
            limit={5}
            recentGames={rightGames}
            font={font}
            gameList={gameList}
          />
        )}
      </SideColumn>
      {showRecentGames && generalGoals.length > 0 && (
        <SideColumn isDouble={false}>
          <RecentGames
            limit={6}
            recentGames={rightGames}
            font={font}
            gameList={gameList}
          />
        </SideColumn>
      )}
    </Group>
  );
}
