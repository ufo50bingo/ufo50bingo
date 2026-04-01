export default function getExistingRanges(
  rows: ReadonlyArray<ReadonlyArray<string>>,
  value: string,
): ReadonlyArray<[number, number]> {
  const ranges: [number, number][] = [];
  let startIndex: null | number = null;
  rows.forEach((row, index) => {
    if (startIndex == null && row[0] === value) {
      startIndex = index;
    } else if (startIndex != null && row[0] !== value) {
      ranges.push([startIndex, index]);
      startIndex = null;
    }
  });
  if (startIndex != null) {
    ranges.push([startIndex, rows.length]);
  }
  return ranges;
}
