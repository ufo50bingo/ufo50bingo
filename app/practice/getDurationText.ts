export default function getDurationText(
  duration: number,
  showDecimal: boolean = true,
  forceShowHours: boolean = false
): string {
  // round to nearest 10th of a second before computing hours/mins
  // this prevents issues like an actual value of 13:59.99 displaying
  // as 13:60.0
  const totalSeconds = showDecimal
    ? Math.round(Math.abs(duration / 100)) / 10
    : Math.round(Math.abs(duration / 1000));
  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes - hours * 60;
  const seconds = totalSeconds - totalMinutes * 60;

  let finalStr = showDecimal
    ? seconds.toFixed(1).padStart(4, "0")
    : seconds.toString().padStart(2, "0");
  finalStr =
    (forceShowHours || hours > 0
      ? minutes.toString().padStart(2, "0")
      : minutes.toString()) +
    ":" +
    finalStr;
  if (forceShowHours || hours > 0) {
    finalStr = hours.toString() + ":" + finalStr;
  }
  return duration < 0 ? "-" + finalStr : finalStr;
}
