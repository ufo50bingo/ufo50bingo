import { ReactNode } from "react";
import { BingosyncColor, BLANK_WHITE, getColorHex } from "../color";

type Props = {
  color: BingosyncColor | null;
  children: ReactNode;
};

export default function BingosyncColored({ color, children }: Props) {
  return (
    <span style={{ color: color == null ? BLANK_WHITE : getColorHex(color) }}>
      {children}
    </span>
  );
}
