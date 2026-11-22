import { ColorSwatch, Select, Group } from "@mantine/core";
import { BingosyncColor, COLOR_INFO, getColorHex } from "@/app/color";

const COLOR_OPTIONS = COLOR_INFO.map((c) => ({
  value: c.key,
  label: c.name,
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
