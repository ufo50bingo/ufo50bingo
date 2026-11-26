import { memo } from "react";
import { isAspectRatioLocked } from "./widgetInfo";
import WidgetContent, { getWidgetPositionStyle } from "./WidgetContent";
import type { Widget } from "./widgetTypes";

type Props = {
  widget: Widget;
};

// a widget in the layout editor
function WidgetView({ widget }: Props) {
  return (
    <div
      className="editor-widget"
      data-id={widget.id}
      data-lock-aspect-ratio={
        isAspectRatioLocked(widget.type) ? "true" : "false"
      }
      style={{ ...getWidgetPositionStyle(widget), userSelect: "none" }}
    >
      <WidgetContent widget={widget} />
    </div>
  );
}

export default memo(WidgetView);
