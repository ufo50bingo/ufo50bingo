import { Select } from "@mantine/core";
import { Font } from "./useFont";

type Props = {
    font: Font;
    setFont: (font: Font) => unknown;
}

export default function FontSelector({ font, setFont }: Props) {
    return (
        <Select
            label="Font"
            data={[{ value: "default", label: "Default" }, { value: "ufo50", label: "UFO 50" }]}
            value={font}
            onChange={(newFont) => setFont(newFont as Font)}
        />
    );
}