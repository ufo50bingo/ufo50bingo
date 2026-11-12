export default function range(n: number): Array<number> {
  return Array(n)
    .fill(null)
    .map((_, idx) => idx);
}
