import { ReactNode } from "react";
import { TBoard, Change, Changelog } from "./parseBingosyncData";
import { Stack } from "@mantine/core";
import BingosyncColored, { getColorClass } from "./BingosyncColored";
import { getHost, setUrlAtTime, VodHost } from "./vodUtil";
import classes from "./ViewChangelog.module.css";
import { getMatchStartTime } from "./analyzeMatch";

type VodWithStartSeconds = { url: string; startSeconds: number };

type Props = {
  vod: null | VodWithStartSeconds;
  board: TBoard;
  changelog: Changelog;
  analysisSeconds: number;
};

function getBaseUrlAndHost(
  vodUrl: null | undefined | string
): null | [string, VodHost] {
  if (vodUrl == null) {
    return null;
  }
  try {
    const url = new URL(vodUrl);
    const host = getHost(url);
    if (host == null) {
      return null;
    }
    url.searchParams.delete("t");
    return [url.toString(), host];
  } catch {
    return null;
  }
}

export default function ViewChangelog({
  board,
  changelog,
  vod,
  analysisSeconds,
}: Props) {
  const start = getMatchStartTime(changelog, analysisSeconds);
  const startSeconds = vod?.startSeconds;
  const urlAndHost = getBaseUrlAndHost(vod?.url);
  const getLink =
    start != null && startSeconds != null && urlAndHost != null
      ? (time: number) => {
          const url = new URL(urlAndHost[0]);
          setUrlAtTime(urlAndHost[1], url, startSeconds + time - start);
          return url.toString();
        }
      : null;
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
          getLink={getLink}
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
  board: TBoard;
  change: Change;
  getLink: null | ((time: number) => string);
};
function ChangeText({ board, change, getLink }: ChangeTextProps): ReactNode {
  const { time, index, name, color } = change;
  const goalText = board[index].name;
  const verb = color === "blank" ? "cleared" : "marked";
  const text = (
    <BingosyncColored color={change.color}>
      {getTimestamp(time)} {name} {verb} <strong>{goalText}</strong>
    </BingosyncColored>
  );
  const link = getLink != null ? getLink(change.time) : null;
  return (
    <span style={{ fontSize: "14px" }}>
      {link != null ? (
        <a
          href={link}
          className={classes.changelogLink + " " + getColorClass(change.color)}
          target="_blank"
        >
          {text}
        </a>
      ) : (
        text
      )}
    </span>
  );
}
