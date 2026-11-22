import Board from "@/app/Board";
import StandardBoardWrapper from "@/app/StandardBoardWrapper";
import { Group } from "@mantine/core";
import ScoreSquare from "../common/ScoreSquare";
import SyncedTimerBoardCover from "../common/SyncedTimerBoardCover";
import { GeneralItem, TCountPosition } from "./Cast";
import GeneralIcons from "./GeneralIcons";
import RecentGames from "./RecentGames";
import SideCell from "./SideCell";
import SideColumn from "./SideColumn";
import { Font } from "@/app/font/useFont";

type Props = {
  countPosition: TCountPosition;
  showRecentGames: boolean;
  generalGoals: ReadonlyArray<GeneralItem>;
  font: Font;
};

export default function CastBoardWithTrackers({
  countPosition,
  showRecentGames,
  generalGoals,
  font,
}: Props) {
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
          generalGoals={
            generalOrder === "reading" ? generalGoals : sortedGenerals
          }
          generalState={generals}
          iconType={iconType}
          isHidden={areGeneralIconsHidden}
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
      <StandardBoardWrapper rows={game.height} columns={game.width}>
        <Board
          pasta={pasta}
          board={squareColors.map((colors, index) => ({
            name: squareNames[index],
            color: colors.length > 0 ? colors[0] : "blank",
          }))}
          highlights={highlights}
          onClickSquare={(newIndex: number) => {
            if (sendEvents == null) {
              return null;
            }
            setEditingIndex(newIndex);
          }}
          boardCover={
            <SyncedTimerBoardCover
              isCast={true}
              timerState={timerState}
              isBoardVisibleByDefault={!hideByDefault}
              forceReveal={forceReveal}
            />
          }
          shownDifficulties={shownDifficulties}
          viewerColor={null}
          castInfo={{ leftColor, rightColor }}
          rows={game.height}
          columns={game.width}
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
          generalGoals={
            generalOrder === "reading" ? generalGoals : sortedGenerals
          }
          generalState={generals}
          iconType={iconType}
          isHidden={areGeneralIconsHidden}
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
