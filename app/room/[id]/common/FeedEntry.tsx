import BingosyncColored from "@/app/matches/BingosyncColored";
import classes from "./FeedEntry.module.css";
import { NewFeedItem } from "@/app/fetchFeed";
import { GenericMember } from "./useMembers";
import { IconEyeOff } from "@tabler/icons-react";
import { Stack, Tooltip } from "@mantine/core";

type Props = {
  entry: NewFeedItem;
  squareNames: ReadonlyArray<string>;
  members: ReadonlyMap<number, GenericMember>;
};

// reference: https://github.com/kbuzsaki/bingosync/blob/b23d3b4e3192e7034573f3e8efc906aa4a83b0b8/bingosync-app/static/bingosync/room/chat_panel.js#L16
export default function FeedEntry({ entry, squareNames, members }: Props) {
  const timestamp = (
    <span className={`${classes.timestamp} ${classes.defaultColor}`}>
      {getTimestamp(entry.time)}
    </span>
  );
  const member = members.get(entry.userId);
  const player = (
    <strong>{member?.overrideName ?? member?.name ?? entry.userId}</strong>
  );
  const coloredPlayer = (
    <BingosyncColored color={member?.color ?? "blank"}>
      {player}
    </BingosyncColored>
  );
  switch (entry.type) {
    case "chat":
      return (
        <span>
          {timestamp} {coloredPlayer}
          <span className={classes.defaultColor}>: </span>
          <BingosyncColored color="blank">{entry.message}</BingosyncColored>
          {entry.visibleToPlayers != null ? (
            <Tooltip
              label={
                <Stack gap={0}>
                  <div>Visible to players:</div>
                  {entry.visibleToPlayers.map((visibleId) => {
                    const member = members.get(visibleId);
                    const name =
                      member?.overrideName ?? member?.name ?? visibleId;
                    return <span key={visibleId}>{name}</span>;
                  })}
                </Stack>
              }
            >
              <IconEyeOff size={12} style={{ marginLeft: "4px" }} />
            </Tooltip>
          ) : null}
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
            <strong>{squareNames[entry.squareIndex]}</strong>
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
