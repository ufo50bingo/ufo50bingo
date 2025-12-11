import shuffle from "../createboard/shuffle";

export default function getMagicSquare(): ReadonlyArray<number> {
  const quotientRow = [0, 1, 2, 3, 4];
  const remainderRow = [0, 1, 2, 3, 4];
  shuffle(quotientRow);
  shuffle(remainderRow);
  return [...Array(25)].map((_, index) => {
    const rowIndex = Math.floor(index / 5);
    const qIndex = (index + rowIndex * 2) % 5;
    const rIndex = (index - rowIndex * 2) % 5;
    return quotientRow[qIndex] * 5 + remainderRow[rIndex];
  });
}
