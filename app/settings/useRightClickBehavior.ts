import useLocalEnum from "../localStorage/useLocalEnum";

const OPTIONS = ["star", "my_color", "custom_color"] as const;
export type RightClickBehavior = (typeof OPTIONS)[number];

export default function useRightClickBehavior(): [
  RightClickBehavior,
  (newValue: RightClickBehavior) => void,
] {
  return useLocalEnum({
    key: "right_click_behavior",
    options: OPTIONS,
    defaultValue: "star",
  });
}
