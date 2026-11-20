import { memo } from "react";
import Board from "../Board";
import { BingosyncColor } from "../color";
import { getWidgetLabel, isAspectRatioLocked } from "./widgetInfo";
import type { Widget } from "./widgetTypes";

type Props = {
  widget: Widget;
};

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
