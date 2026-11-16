import { Counts } from "../generator/ufoGenerator";

export default function scaleCounts(
  counts: Counts,
  targetTotal: number,
): Counts {
  const entries = Object.entries(counts);
  const originalTotal = entries.reduce((acc, [, value]) => acc + value, 0);

  if (originalTotal === 0 || targetTotal === 0) {
    throw new Error("Cannot scale to/from 0");
  }

  const scaledCounts = entries.map(([difficulty, count], index) => {
    const exact = (count / originalTotal) * targetTotal;
    const floor = Math.floor(exact);

    return {
      difficulty,
      value: floor,
      remainder: exact - floor,
      order: index,
    };
  });
  const byRemainder = [...scaledCounts].sort((a, b) => {
    const remainderDiff = b.remainder - a.remainder;
    if (remainderDiff !== 0) {
      return remainderDiff;
    }
    return a.order - b.order;
  });

  const remaining =
    targetTotal - scaledCounts.reduce((acc, item) => acc + item.value, 0);
  for (let i = 0; i < remaining; i++) {
    // byRemainder shares the same objects as scaledCounts, so updating value
    // here also updates scaledCounts
    byRemainder[i].value += 1;
  }

  return Object.fromEntries(
    scaledCounts.map((item) => [item.difficulty, item.value]),
  );
}
