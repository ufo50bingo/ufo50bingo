import { ColorPicker, Select, Stack } from "@mantine/core";
import { RightClickBehavior } from "./useRightClickBehavior";
import { useRightClickBehaviorContext } from "./RightClickBehaviorContext";
import { useAppContext } from "../AppContextProvider";

type Props = {
  label?: string;
};

const DATA = [
  { value: "star", label: "Star" },
  { value: "my_color", label: "Highlight in my color" },
  { value: "custom_color", label: "Highlight in custom color" },
];

export default function SelectRightClickBehavior({ label }: Props) {
  const {
    rightClickBehavior,
    setRightClickBehavior,
    customColor,
    setCustomColor,
  } = useRightClickBehaviorContext();
  const { isMounted } = useAppContext();
  return (
    <Stack gap={4}>
      <Select
        label={label}
        value={rightClickBehavior}
        data={DATA}
        onChange={(value) => setRightClickBehavior(value as RightClickBehavior)}
      />
      {isMounted && rightClickBehavior === "custom_color" && (
        <ColorPicker value={customColor} onChange={setCustomColor} />
      )}
    </Stack>
  );
}
