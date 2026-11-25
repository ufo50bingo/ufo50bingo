import { Select } from "@mantine/core";
import { LAYOUT_FONT_OPTIONS, LayoutFont } from "../font/useFont";
import { getFontFamily, getFontLabel } from "../font/getFontClassname";

type Props = {
  font: LayoutFont;
  setFont: (font: LayoutFont) => unknown;
};

const DATA = LAYOUT_FONT_OPTIONS.map((font) => ({
  value: font,
  label: getFontLabel(font),
}));

// unlike the site-wide FontSelector, this also offers the Google fonts
export default function LayoutFontSelector({ font, setFont }: Props) {
  return (
    <Select
      label="Font"
      data={DATA}
      value={font}
      allowDeselect={false}
      searchable={true}
      // each option is shown in its own font
      renderOption={({ option }) => (
        <span
          style={{
            fontFamily: getFontFamily(option.value as LayoutFont) ?? undefined,
          }}
        >
          {option.label}
        </span>
      )}
      onChange={(newFont) => newFont != null && setFont(newFont as LayoutFont)}
    />
  );
}
