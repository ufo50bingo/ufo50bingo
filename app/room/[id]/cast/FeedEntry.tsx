import BingosyncColored from "@/app/matches/BingosyncColored";
import { RawFeedItem } from "@/app/matches/parseBingosyncData";
import classes from "./FeedEntry.module.css";

type Props = {
  entry: RawFeedItem;
};

// reference: https://github.com/kbuzsaki/bingosync/blob/b23d3b4e3192e7034573f3e8efc906aa4a83b0b8/bingosync-app/static/bingosync/room/chat_panel.js#L16
export default function FeedEntry({ entry }: Props) {
  const timestamp = (
    <span className={`${classes.timestamp} ${classes.defaultColor}`}>
      {getTimestamp(entry.timestamp)}
    </span>
  );
  const player = <strong>{entry.player.name}</strong>;
  const coloredPlayer = (
    <BingosyncColored color={entry.player_color}>{player}</BingosyncColored>
  );
  switch (entry.type) {
    case "chat":
      return (
        <span>
          {timestamp} {coloredPlayer}
          <span className={classes.defaultColor}>: </span>
          <BingosyncColored color="blank">{entry.text}</BingosyncColored>
        </span>
      );
    case "new-card":
      return (
        <em>
          {timestamp} {coloredPlayer}{" "}
          <span className={classes.defaultColor}>generated a new card for</span>{" "}
          <BingosyncColored color="blank">
            <strong>{entry.game}</strong>
          </BingosyncColored>
          . seed:{" "}
          <BingosyncColored color="blank">
            <strong>{entry.seed}</strong>
          </BingosyncColored>
        </em>
      );
    case "goal":
      return (
        <em>
          {timestamp} {coloredPlayer}{" "}
          <span className={classes.defaultColor}>
            {entry.remove ? "cleared" : "marked"}
          </span>{" "}
          <BingosyncColored color={entry.remove ? "blank" : entry.color}>
            <strong>{entry.square.name}</strong>
          </BingosyncColored>
        </em>
      );
    case "color":
      return (
        <em>
          {timestamp} {coloredPlayer}{" "}
          <span className={classes.defaultColor}>changed color to</span>{" "}
          <BingosyncColored color={entry.color}>
            <strong>{entry.color}</strong>
          </BingosyncColored>
        </em>
      );
    case "revealed":
      return (
        <em>
          {timestamp} {coloredPlayer}{" "}
          <span className={classes.defaultColor}>revealed the card</span>
        </em>
      );
    case "connection":
      return (
        <em>
          {timestamp}{" "}
          <span className={classes.defaultColor}>
            {entry.player.name} {entry.event_type}
          </span>
        </em>
      );
    case "other":
      return null;
  }
}

function getTimestamp(time: number): string {
  return new Date(time * 1000).toLocaleString(undefined, {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
}
