import { IconCircleCheckFilled } from "@tabler/icons-react";
import StandaloneText from "./StandaloneText";
import type { GeneralCount } from "./widgetTypes";

type Props = {
  widget: GeneralCount;
};

const CHECK_STYLE = {
  height: "1cap",
  width: "1cap",
  verticalAlign: "baseline",
} as const;

export default function StandaloneGeneralCount({ widget }: Props) {
  // TODO: Deal with this
  const isComplete = widget.generalNumber % 2 === 0;
  const count = widget.generalNumber + 1;

  return (
    <StandaloneText
      widget={widget}
      text={
        !isComplete ? (
          count
        ) : widget.font === "ufo50" ? (
          <img
            src="/elf_check.png"
            alt="checkmark"
            style={{ ...CHECK_STYLE, imageRendering: "pixelated" }}
          />
        ) : (
          <IconCircleCheckFilled color="green" style={CHECK_STYLE} />
        )
      }
    />
  );
}
