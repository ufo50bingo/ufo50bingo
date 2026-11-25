import type { CSSProperties, ReactNode } from "react";
import { BingosyncColor, COLORS, getColorHex } from "../color";
import { getFontFamily } from "../font/getFontClassname";
import SquareText from "../SquareText";
import type { CanShrinkFont, HasColor } from "./widgetTypes";

type Props = {
  widget: CanShrinkFont & HasColor;
  text: ReactNode;
  className?: string;
  style?: CSSProperties;
};

// text in the widget's font and color, possibly shrunk to fit its dimensions
export default function StandaloneText({
  widget,
  text,
  className,
  style,
}: Props) {
  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        lineHeight: 1,
        fontFamily: getFontFamily(widget.font) ?? undefined,
        fontWeight: "bold",
        fontVariantNumeric: "tabular-nums",
        color: getWidgetColor(widget.color),
        ...style,
      }}
    >
      <SquareText
        text={text}
        maxFontSize={widget.defaultSize}
        minFontSize={widget.canShrink ? widget.minSize : widget.defaultSize}
      />
    </div>
  );
}

// TODO: Replace with the player's real color
export function getSamplePlayerColor(playerNum: number): BingosyncColor {
  return COLORS[(playerNum - 1) % COLORS.length];
}

export function getWidgetColor(color: HasColor["color"]): string {
  switch (color.type) {
    case "custom_color":
      return color.color;
    case "player_color":
      return getColorHex(getSamplePlayerColor(color.playerNum));
  }
}
