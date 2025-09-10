import { IconBrandTwitch, IconBrandYoutube } from "@tabler/icons-react";
import { ScheduledMatch } from "./fetchSchedule";
import { ActionIcon, Anchor, Text, Tooltip } from "@mantine/core";

type Props = {
  match: ScheduledMatch;
  includeDate: boolean;
};

export default function ScheduledMatchView({ match, includeDate }: Props) {
  const date = new Date(match.time * 1000).toLocaleString(
    undefined,
    includeDate
      ? {
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        }
      : {
          hour: "numeric",
          minute: "numeric",
        }
  );
  const streamer =
    match.streamer == null ? (
      "No streamer yet"
    ) : match.streamLink == null ? (
      <Tooltip label="No stream link found">{match.streamer}</Tooltip>
    ) : (
      <Anchor href={match.streamLink} target="_blank">
        {match.streamLink.includes("youtube") ||
        match.streamLink.includes("youtu.be") ? (
          <ActionIcon size="sm" color="red">
            <IconBrandYoutube size={16} />
          </ActionIcon>
        ) : (
          <ActionIcon size="sm" color="violet">
            <IconBrandTwitch size={16} />
          </ActionIcon>
        )}{" "}
        {match.streamer}
      </Anchor>
    );
  return (
    <Text>
      {date} — {match.tier} — {match.name} — {streamer}
    </Text>
  );
}
