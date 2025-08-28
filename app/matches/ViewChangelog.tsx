import { ReactNode, useMemo } from "react";
import { Board, Change, Changelog } from "./parseBingosyncData";
import { Stack } from "@mantine/core";
import BingosyncColored from "./BingosyncColored";

type Props = {
  board: Board;
  changelog: Changelog;
};

export default function ViewChangelog({ board, changelog }: Props) {
  return (
    <Stack gap={6}>
      {changelog.reveals.map((reveal, index) => (
        <span key={index} style={{ fontSize: "14px" }}>
          {getTimestamp(reveal.time)} {reveal.name} revealed the card
        </span>
      ))}
      {changelog.changes.map((change, index) => (
        <ChangeText
          key={changelog.reveals.length + index}
          change={change}
          board={board}
        />
      ))}
    </Stack>
  );
}

function getTimestamp(time: number): string {
  return new Date(time * 1000).toLocaleString(undefined, {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
}

type ChangeTextProps = {
  board: Board;
  change: Change;
};
function ChangeText({ board, change }: ChangeTextProps): ReactNode {
  const { time, index, name, color } = change;
  const goalText = board[index].name;
  const verb = color === "blank" ? "cleared" : "marked";
  return (
    <span style={{ fontSize: "14px" }}>
      <BingosyncColored color={change.color}>
        {getTimestamp(time)} {name} {verb} <strong>{goalText}</strong>
      </BingosyncColored>
    </span>
  );
}
