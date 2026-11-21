import { memo } from "react";
import Board from "../Board";
import { BingosyncColor } from "../color";
import { getWidgetLabel, isAspectRatioLocked } from "./widgetInfo";
import type { Widget } from "./widgetTypes";
import PlayedGame from "../room/[id]/cast/PlayedGame";
import { ORDERED_PROPER_GAMES } from "../goals";
import getGameList from "../room/[id]/common/getGameList";
import { STANDARD_UFO } from "../pastas/standardUfo";
import GeneralIcon from "../room/[id]/cast/GeneralIcon";
import StandaloneGeneralCount from "./StandaloneGeneralCount";
import findGoal, { FoundGoalWithCast } from "../findGoal";

type Props = {
  widget: Widget;
};

const UFO_50_SUBCATEGORIES = new Map(
  ORDERED_PROPER_GAMES.map((game, idx) => [idx + 1, game]),
);
const UFO_50_GAME_LIST = getGameList(STANDARD_UFO);

// placeholder general goals until the layout is connected to a match, one list
// per subcategory so consecutive general numbers cycle through subcategories
const SAMPLE_GENERAL_SUBCATEGORIES = [
  "gift",
  "goldcherry",
  "bossenemy",
  "level",
  "theme",
] as const;
const SAMPLE_GENERAL_GOALS: ReadonlyArray<
  ReadonlyArray<FoundGoalWithCast<string, string, string>>
> = SAMPLE_GENERAL_SUBCATEGORIES.map((subcategory) =>
  STANDARD_UFO.goals.general[subcategory]
    .map((goal) =>
      findGoal(typeof goal === "string" ? goal : goal.name, STANDARD_UFO),
    )
    .filter(
      (found): found is FoundGoalWithCast<string, string, string> =>
        found?.cast != null,
    ),
);

function getSampleGeneralGoal(
  generalNumber: number,
): FoundGoalWithCast<string, string, string> {
  const index = generalNumber - 1;
  const goals = SAMPLE_GENERAL_GOALS[index % SAMPLE_GENERAL_GOALS.length];
  return goals[Math.floor(index / SAMPLE_GENERAL_GOALS.length) % goals.length];
}

const squareNames: ReadonlyArray<string> = Array(25).fill(
  "BARBUTA: Speak to 2 different Bean NPCs",
);
const squareColors: ReadonlyArray<ReadonlyArray<BingosyncColor>> = Array(
  25,
).fill([]);

function WidgetView({ widget }: Props) {
  return (
    <div
      className="editor-widget"
      data-id={widget.id}
      data-lock-aspect-ratio={
        isAspectRatioLocked(widget.type) ? "true" : "false"
      }
      style={{
        position: "absolute",
        left: widget.x,
        top: widget.y,
        width: widget.width,
        height: widget.height,
        zIndex: widget.z,
        boxSizing: "border-box",
        border: "2px solid red",
        background: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
      }}
    >
      <WidgetContent widget={widget} />
    </div>
  );
}

function WidgetContent({ widget }: Props) {
  switch (widget.type) {
    case "board":
      return (
        <Board
          squareNames={squareNames}
          squareColors={squareColors}
          onClickSquare={() => {}}
          boardCover={null}
          shownDifficulties={[]}
          viewerColor="red"
          maxFontSize={widget.defaultSize}
          minFontSize={widget.canShrink ? widget.minSize : widget.defaultSize}
          rows={5}
          columns={5}
        />
      );
    case "recent_game":
      return (
        <PlayedGame
          recentGame={{
            subcategoryId: widget.recentGameNumber % 50,
            type: "finished",
            duration: 42 * ((widget.recentGameNumber % 20) + 1),
          }}
          subcategoryIdToName={UFO_50_SUBCATEGORIES}
          font="default"
          gameList={UFO_50_GAME_LIST}
          showTimer={widget.hasDefaultTimer}
        />
      );
    case "general_icon":
      return (
        <GeneralIcon
          foundGoal={getSampleGeneralGoal(widget.generalNumber)}
          iconType={widget.iconSet}
          isHidden={false}
          isGray={false}
          countInfo={
            widget.hasInsetCount
              ? { hasCheck: false, count: 3, font: "default" }
              : undefined
          }
        />
      );
    case "general_count":
      return <StandaloneGeneralCount widget={widget} />;
    case "plain_text":
      return (
        <div
          style={{
            fontFamily: widget.font,
            fontSize: widget.defaultSize,
            whiteSpace: "pre-wrap",
          }}
        >
          {widget.text}
        </div>
      );
    default:
      return <div>{getWidgetLabel(widget.type)}</div>;
  }
}

export default memo(WidgetView);
