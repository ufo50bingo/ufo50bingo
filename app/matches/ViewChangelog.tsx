// TODO: Dead code
import { ReactNode } from "react";
import { TBoard, Change, Changelog } from "./parseBingosyncData";
import { Stack } from "@mantine/core";
import { setUrlAtTime } from "./vodUtil";
import { getMatchStartTime } from "./analyzeMatch";
import getBaseUrlAndHost from "./getBaseUrlAndHost";

type VodWithStartSeconds = { url: string; startSeconds: number };

type Props = {
  vod: null | VodWithStartSeconds;
  board: TBoard;
  changelog: Changelog;
  analysisSeconds: number;
};

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
function ChangeText({
  board: _board,
  change: _change,
  getLink: _getLink,
}: ChangeTextProps): ReactNode {
  // TODO: Dead code
  return <span />;
}
