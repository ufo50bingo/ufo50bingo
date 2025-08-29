type DurationProps = {
  duration: number;
};

export default function Duration({ duration }: DurationProps) {
  const totalSeconds = duration / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  return `${minutes}:${seconds.toFixed(1).padStart(4, "0")}`;
}
