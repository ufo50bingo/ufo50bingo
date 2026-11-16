import { ColorSwatch, Select, Group } from "@mantine/core";
import { useMemo } from "react";
import { BingosyncColor, COLORS, getColorHex, getColorName } from "@/app/color";

type Props = {
  label: null | string;
  color: null | BingosyncColor;
  setColor: (newColor: BingosyncColor) => unknown;
  // Colors to choose from. Defaults to every color.
  colors?: ReadonlyArray<BingosyncColor>;
};

export default function ColorSelector({
  label,
  color,
  setColor,
  colors = COLORS,
}: Props) {
  const options = useMemo(
    () => colors.map((c) => ({ value: c, label: getColorName(c) })),
    [colors],
  );
  return (
    <Select
      placeholder="Select a color"
      label={label}
      leftSection={
        color != null ? (
          <ColorSwatch color={getColorHex(color)} size={14} />
        ) : null
      }
      renderOption={({ option }) => (
        <Group>
          <ColorSwatch
            color={getColorHex(option.value as BingosyncColor)}
            size={14}
          />
          <span>{option.label}</span>
        </Group>
      )}
      data={options}
      allowDeselect={false}
      withCheckIcon={false}
      value={color}
      onChange={(newColor) => {
        if (newColor == null) {
          return;
        }
        setColor(newColor as BingosyncColor);
      }}
    />
  );
}
