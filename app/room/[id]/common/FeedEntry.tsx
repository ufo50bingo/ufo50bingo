import BingosyncColored from "@/app/matches/BingosyncColored";
import classes from "./FeedEntry.module.css";
import { NewFeedItem } from "../play/PlayPage";

type Props = {
  entry: NewFeedItem;
};

// reference: https://github.com/kbuzsaki/bingosync/blob/b23d3b4e3192e7034573f3e8efc906aa4a83b0b8/bingosync-app/static/bingosync/room/chat_panel.js#L16
export default function FeedEntry({ entry }: Props) {
  const timestamp = (
    <span className={`${classes.timestamp} ${classes.defaultColor}`}>
      {getTimestamp(entry.time)}
    </span>
  );
  const player = <strong>{entry.user.name}</strong>;
  const coloredPlayer = (
    // TODO: Use proper color
    <BingosyncColored color="red">{player}</BingosyncColored>
  );
  switch (entry.type) {
    case "chat":
      return (
        <span>
          {timestamp} {coloredPlayer}
          <span className={classes.defaultColor}>: </span>
          <BingosyncColored color="blank">{entry.message}</BingosyncColored>
        </span>
      );
    case "color_mark":
      return (
        <em>
          {timestamp} {coloredPlayer}{" "}
          <span className={classes.defaultColor}>
            {entry.isClear ? "cleared" : "marked"}
          </span>{" "}
          <BingosyncColored color={entry.isClear ? "blank" : entry.color}>
            {/* Fill in square text */}
            <strong>{entry.squareIndex}</strong>
          </BingosyncColored>
        </em>
      );
    // case "color":
    //   return (
    //     <em>
    //       {timestamp} {coloredPlayer}{" "}
    //       <span className={classes.defaultColor}>changed color to</span>{" "}
    //       <BingosyncColored color={entry.color}>
    //         <strong>{entry.color}</strong>
    //       </BingosyncColored>
    //     </em>
    //   );
    // case "revealed":
    //   return (
    //     <em>
    //       {timestamp} {coloredPlayer}{" "}
    //       <span className={classes.defaultColor}>revealed the card</span>
    //     </em>
    //   );
    // case "connection":
    //   return (
    //     <em>
    //       {timestamp}{" "}
    //       <span className={classes.defaultColor}>
    //         {entry.player.name} {entry.event_type}
    //       </span>
    //     </em>
    //   );
    // case "other":
    //   return null;
  }
}

function getTimestamp(time: number): string {
  return new Date(time * 1000).toLocaleString(undefined, {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
}
