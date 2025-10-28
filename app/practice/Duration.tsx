import getDurationText from "./getDurationText";

type DurationProps = {
  duration: number;
  showDecimal?: boolean;
};

export default function Duration(props: DurationProps) {
  return getDurationText(props.duration, props.showDecimal);
}
