import { ActionIcon, Group, Tooltip } from "@mantine/core";
import { IconBrandDiscordFilled, ReactNode } from "@tabler/icons-react";
import { ScheduledMatch } from "./fetchSchedule";
import classes from "./CopyToDiscord.module.css";

type Props = {
  children: ReactNode;
  matches: ReadonlyArray<ScheduledMatch>;
  includeDate: boolean;
};

export function CopyToDiscord({ children, matches, includeDate }: Props) {
  return (
    <Group className={classes.container}>
      {children}
      <Tooltip label="Copy schedule with Discord formatting">
        <ActionIcon
          className={classes.discordButton}
          size="sm"
          color="indigo"
          style={{ borderRadius: "50%" }}
          onClick={() =>
            navigator.clipboard.writeText(
              matches
                .map((match) => {
                  const stream =
                    match.streamer != null &&
                    match.streamer != "" &&
                    match.streamLink != null &&
                    match.streamLink != ""
                      ? `[${match.streamer}](<${match.streamLink}>)`
                      : match.streamer != null && match.streamer != ""
                      ? match.streamer
                      : "No streamer yet";
                  return `<t:${match.time}:${includeDate ? "f" : "t"}> — ${
                    match.tier
                  } — ${match.name} — ${stream}`;
                })
                .join("\n")
            )
          }
        >
          <IconBrandDiscordFilled size={12} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
