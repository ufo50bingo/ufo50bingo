import { BingosyncColor } from "../matches/parseBingosyncData";

function getEmoji(color: BingosyncColor): string {
  switch (color) {
    case "blank":
      return "⬛";
    case "red":
      return "🟥";
    case "blue":
      return "🟦";
    case "green":
      return "🟩";
    case "orange":
      return "🟧";
    case "purple":
      return "🟪";
    case "navy":
      return "🟦";
    case "teal":
      return "🟩";
    case "pink":
      return "🟪";
    case "brown":
      return "🟫";
    case "yellow":
      return "🟨";
  }
}

export default function getEmojiBoard(
  board: ReadonlyArray<boolean>,
  color: BingosyncColor
): string {
  const blankEmoji = getEmoji("blank");
  const markedEmoji = getEmoji(color);
  let final = "";
  board.forEach((isMarked, index) => {
    if (index > 0 && index % 5 == 0) {
      final += "\n";
    }
    final += isMarked ? markedEmoji : blankEmoji;
  });
  return final;
}
