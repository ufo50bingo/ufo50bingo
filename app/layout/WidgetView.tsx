import { memo } from "react";
import type { Widget } from "./layoutTypes";

type Props = {
  widget: Widget;
};

function WidgetView({ widget }: Props) {
  return (
    <div
      className="editor-widget"
      data-id={widget.id}
      data-lock-aspect-ratio={
        widget.lockAspectRatio === true ? "true" : "false"
      }
      style={{
        position: "absolute",
        left: widget.x,
        top: widget.y,
        width: widget.width,
        height: widget.height,
        boxSizing: "border-box",
        border: "2px solid red",
        background: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
      }}
    >
      {widget.content}
    </div>
  );
}

export default memo(WidgetView);
