import { BingosyncColor, getColorEmoji } from "../color";

export default function getEmojiBoard(
  board: ReadonlyArray<boolean>,
  color: BingosyncColor,
): string {
  const markedEmoji = getColorEmoji(color);
  let final = "";
  board.forEach((isMarked, index) => {
    if (index > 0 && index % 5 == 0) {
      final += "\n";
    }
    final += isMarked ? markedEmoji : "⬛";
  });
  return final;
}
