type DurationProps = {
  duration: number;
};

export default function Duration({ duration }: DurationProps) {
  const totalSeconds = Math.abs(duration / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes - hours * 60;
  const seconds = totalSeconds - totalMinutes * 60;

  let finalStr = seconds.toFixed(1).padStart(4, "0");
  finalStr =
    (hours > 0 ? minutes.toString().padStart(2, "0") : minutes.toString()) +
    ":" +
    finalStr;
  if (hours > 0) {
    finalStr = hours.toString() + finalStr;
  }
  return duration < 0 ? "-" + finalStr : finalStr;
}
