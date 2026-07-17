import { useCallback, useMemo } from "react";
import useLocalString from "../localStorage/useLocalString";
import useCustomColor from "./useCustomColor";
import zod from "zod";

export type RightClickBehavior =
  | { type: "star" }
  | { type: "my_color" }
  | { type: "custom_color"; color: string };

export default function useRightClickBehavior(): [
  ReadonlyArray<RightClickBehavior>,
  (newValue: ReadonlyArray<RightClickBehavior>) => void,
] {
  const [rawValue, setValue] = useLocalString({
    key: "right_click_behavior",
    defaultValue: "",
  });
  const [customColor, _] = useCustomColor();
  const setRightClickBehavior = useCallback(
    (newValue: ReadonlyArray<RightClickBehavior>) =>
      setValue(JSON.stringify(newValue)),
    [setValue],
  );
  const rightClickBehavior = useMemo(
    () => parseRightClickBehavior(rawValue, customColor),
    [customColor, rawValue],
  );
  return [rightClickBehavior, setRightClickBehavior];
}

const SCHEMA = zod.array(
  zod.discriminatedUnion("type", [
    zod.object({ type: zod.literal("star") }),
    zod.object({ type: zod.literal("my_color") }),
    zod.object({ type: zod.literal("custom_color"), color: zod.string() }),
  ]),
);

function parseRightClickBehavior(
  raw: string,
  customColor: string,
): ReadonlyArray<RightClickBehavior> {
  // backwards compatibility
  if (raw === "star") {
    return [{ type: "star" }];
  }
  if (raw === "my_color") {
    return [{ type: "star" }];
  }
  if (raw === "custom_color") {
    return [{ type: "custom_color", color: customColor }];
  }
  try {
    const parsed = JSON.parse(raw);
    return SCHEMA.parse(parsed);
  } catch {
    return [{ type: "star" }];
  }
}
