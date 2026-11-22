import useLocalEnum from "@/app/localStorage/useLocalEnum";

const COUNT_POSITION = ["side_by_side", "inset"] as const;
export type TCountPosition = (typeof COUNT_POSITION)[number];

export default function useCountPosition(): [
  TCountPosition,
  (newValue: TCountPosition) => void,
] {
  return useLocalEnum({
    key: "count-position",
    defaultValue: "side_by_side",
    options: COUNT_POSITION,
  });
}
