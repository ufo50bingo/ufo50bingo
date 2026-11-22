import { IconCircleCheckFilled } from "@tabler/icons-react";
import { COLORS, getColorHex } from "../color";
import { UFO_50_FONT_FAMILY } from "../font/getFontClassname";
import SquareText from "../SquareText";
import type { GeneralCount, HasColor } from "./widgetTypes";

type Props = {
  widget: GeneralCount;
};

const CHECK_STYLE = {
  height: "1cap",
  width: "1cap",
  verticalAlign: "baseline",
} as const;

export default function StandaloneGeneralCount({ widget }: Props) {
  const isUfo50 = widget.font === "ufo50";
  // TODO: Deal with this
  const isComplete = widget.generalNumber % 2 === 0;
  const count = widget.generalNumber + 1;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        lineHeight: 1,
        fontFamily: isUfo50 ? UFO_50_FONT_FAMILY : widget.font,
        fontWeight: "bold",
        fontVariantNumeric: "tabular-nums",
        color: getColor(widget.color),
      }}
    >
      <SquareText
        text={
          !isComplete ? (
            count
          ) : isUfo50 ? (
            <img
              src="/elf_check.png"
              alt="checkmark"
              style={{ ...CHECK_STYLE, imageRendering: "pixelated" }}
            />
          ) : (
            <IconCircleCheckFilled color="green" style={CHECK_STYLE} />
          )
        }
        maxFontSize={widget.defaultSize}
        minFontSize={widget.canShrink ? widget.minSize : widget.defaultSize}
      />
    </div>
  );
}

// TODO: Replace with real color
function getColor(color: HasColor["color"]): string {
  switch (color.type) {
    case "custom_color":
      return color.color;
    case "player_color":
      return getColorHex(COLORS[(color.playerNum - 1) % COLORS.length]);
  }
}
