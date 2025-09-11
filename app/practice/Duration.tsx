type DurationProps = {
  duration: number;
};

export default function Duration({ duration }: DurationProps) {
  // round to nearest 10th of a second
  const totalSeconds = Math.round(Math.abs(duration / 100)) / 10;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  let minutes = totalMinutes - hours * 60;
  let seconds = totalSeconds - totalMinutes * 60;

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
