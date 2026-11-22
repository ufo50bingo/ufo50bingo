import { ColorSwatch, Select, Group } from "@mantine/core";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import getColorHex from "../cast/getColorHex";

export const COLORS: ReadonlyArray<BingosyncColor> = [
  "orange",
  "red",
  "blue",
  "green",
  "purple",
  "navy",
  "teal",
  "brown",
  "pink",
  "yellow",
];

const COLOR_OPTIONS = COLORS.map((c) => ({
  value: c,
  label: c.charAt(0).toUpperCase() + c.slice(1),
}));

type Props = {
  label: null | string;
  color: null | BingosyncColor;
  setColor: (newColor: BingosyncColor) => unknown;
};

export default function ColorSelector({ label, color, setColor }: Props) {
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
      data={COLOR_OPTIONS}
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
