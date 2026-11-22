import BingosyncColored from "@/app/matches/BingosyncColored";
import classes from "./FeedEntry.module.css";
import { GenericMember } from "./useMembers";
import { IconEyeOff } from "@tabler/icons-react";
import { Stack, Tooltip } from "@mantine/core";
import { DisplayedFeedItem } from "./FeedBuilder";
import { getColorName } from "@/app/color";
import Duration from "@/app/practice/Duration";

type Props = {
  entry: DisplayedFeedItem;
  members: ReadonlyMap<number, GenericMember>;
  link?: null | string;
};

export default function FeedEntry({ entry, members, link }: Props) {
  const content = <FeedEntryContent entry={entry} members={members} />;
  if (link == null) {
    return content;
  }
  return (
    <div>
      <a href={link} target="_blank" className={classes.link}>
        {content}
      </a>
    </div>
  );
}

type ContentProps = {
  entry: DisplayedFeedItem;
  members: ReadonlyMap<number, GenericMember>;
};

// reference: https://github.com/kbuzsaki/bingosync/blob/b23d3b4e3192e7034573f3e8efc906aa4a83b0b8/bingosync-app/static/bingosync/room/chat_panel.js#L16
function FeedEntryContent({ entry, members }: ContentProps) {
  const timestamp = (
    <span className={`${classes.timestamp} ${classes.defaultColor}`}>
      {getTimestamp(entry.time)}
    </span>
  );
  const member = members.get(entry.userId);
  const displayedUser = (
    <BingosyncColored color={entry.userColor}>
      <strong>{member?.overrideName ?? member?.name ?? entry.userId}</strong>
    </BingosyncColored>
  );
  switch (entry.type) {
    case "chat":
      return (
        <span>
          {timestamp} {displayedUser}
          <span className={classes.defaultColor}>: </span>
          <BingosyncColored color={null}>{entry.message}</BingosyncColored>
          {entry.visibleToPlayerIds != null ? (
            <Tooltip
              label={
                <Stack gap={0}>
                  <div>Visible to players:</div>
                  {entry.visibleToPlayerIds.map((visibleId) => {
                    const member = members.get(visibleId);
                    const name =
                      member?.overrideName ?? member?.name ?? visibleId;
                    return <span key={visibleId}>{name}</span>;
                  })}
                </Stack>
              }
            >
              <span
                className={classes.unlinked}
                onClick={(event) => event.preventDefault()}
              >
                <IconEyeOff size={12} style={{ marginLeft: "4px" }} />
              </span>
            </Tooltip>
          ) : null}
        </span>
      );
    case "mark":
      if (entry.userColor == null && entry.isClear) {
        return (
          <em>
            {timestamp} {displayedUser}{" "}
            <span className={classes.defaultColor}>cleared</span>{" "}
            <BingosyncColored color={entry.squareColor}>
              {getColorName(entry.squareColor)}
            </BingosyncColored>{" "}
            from{" "}
            <BingosyncColored color={null}>
              <strong>{entry.squareName}</strong>
            </BingosyncColored>
          </em>
        );
      }
      return (
        <em>
          {timestamp} {displayedUser}{" "}
          <span className={classes.defaultColor}>
            {entry.isClear ? "cleared" : "marked"}
          </span>{" "}
          <BingosyncColored color={entry.isClear ? null : entry.squareColor}>
            <strong>{entry.squareName}</strong>
          </BingosyncColored>
        </em>
      );
    case "failed_mark":
      return (
        <em>
          {timestamp} {displayedUser}{" "}
          <span className={classes.defaultColor}>lost the race to mark</span>{" "}
          <BingosyncColored color={null}>
            <strong>{entry.squareName}</strong>
          </BingosyncColored>
        </em>
      );
    case "color_change":
      return (
        <em>
          {timestamp} {displayedUser}{" "}
          <span className={classes.defaultColor}>changed color to</span>{" "}
          <BingosyncColored color={entry.newColor}>
            <strong>{getColorName(entry.newColor)}</strong>
          </BingosyncColored>
        </em>
      );
    case "join":
      return (
        <em>
          {timestamp} {displayedUser}{" "}
          <span className={classes.defaultColor}>joined the room as a</span>{" "}
          <BingosyncColored color={entry.userColor}>
            <strong>{entry.userColor == null ? "caster" : "player"}</strong>
          </BingosyncColored>
        </em>
      );
    case "disconnect":
      return (
        <em>
          {timestamp} {displayedUser}{" "}
          <span className={classes.defaultColor}>left the room</span>
        </em>
      );
    case "role_change":
      return (
        <em>
          {timestamp} {displayedUser}{" "}
          <span className={classes.defaultColor}>became a</span>{" "}
          <BingosyncColored color={entry.newColor}>
            <strong>{entry.newColor == null ? "caster" : "player"}</strong>
          </BingosyncColored>
        </em>
      );
    case "set_duration":
      return (
        <em>
          {timestamp} {displayedUser}{" "}
          <span className={classes.defaultColor}>
            set the timer to{" "}
            <Duration showDecimal={false} duration={entry.duration * 1000} />
          </span>
        </em>
      );
    case "pause":
      return (
        <em>
          {timestamp} {displayedUser}{" "}
          <span className={classes.defaultColor}>paused the match</span>
        </em>
      );
    case "start":
      return (
        <em>
          {timestamp} {displayedUser}{" "}
          <span className={classes.defaultColor}>started the match</span>
        </em>
      );
    case "end_game":
      return (
        <em>
          {timestamp} {displayedUser}{" "}
          <span className={classes.defaultColor}>ended the match</span>
        </em>
      );
    default:
      entry satisfies never;
      break;
  }
}

function getTimestamp(time: number): string {
  return new Date(time * 1000).toLocaleString(undefined, {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
}
