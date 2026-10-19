import useLocalString from "@/app/localStorage/useLocalString";
import { RightClickBehavior } from "@/app/settings/useRightClickBehavior";
import { useCallback, useMemo } from "react";
import zod from "zod";

export default function useCastRightClickBehavior(): [
  ReadonlyArray<RightClickBehavior>,
  (newValue: ReadonlyArray<RightClickBehavior>) => void,
] {
  const [rawValue, setValue] = useLocalString({
    key: "cast_right_click_behavior",
    defaultValue: "",
  });
  const setRightClickBehavior = useCallback(
    (newValue: ReadonlyArray<RightClickBehavior>) =>
      setValue(JSON.stringify(newValue)),
    [setValue],
  );
  const rightClickBehavior = useMemo(
    () => parseRightClickBehavior(rawValue),
    [rawValue],
  );
  return [rightClickBehavior, setRightClickBehavior];
}

const SCHEMA = zod.array(
  zod.discriminatedUnion("type", [
    zod.object({ type: zod.literal("star") }),
    zod.object({ type: zod.literal("left_hold") }),
    zod.object({ type: zod.literal("right_hold") }),
  ]),
);

function parseRightClickBehavior(
  raw: string,
): ReadonlyArray<RightClickBehavior> {
  try {
    const parsed = JSON.parse(raw);
    return SCHEMA.parse(parsed);
  } catch {
    return [{ type: "star" }, { type: "left_hold" }, { type: "right_hold" }];
  }
}
