import {
  Container,
  Card,
  Stack,
  Title,
  Alert,
  Anchor,
  List,
} from "@mantine/core";
import { ScheduledMatch } from "./fetchSchedule";
import ScheduledMatchView from "./ScheduledMatchView";
import { revalidateSchedule } from "./revalidateSchedule";
import { CopyToDiscord } from "./CopyToDiscord";
import { Ref, useEffect, useRef } from "react";

type Props = {
  schedule: ReadonlyArray<ScheduledMatch>;
};

function getMatches(
  schedule: ReadonlyArray<ScheduledMatch>,
  startOfDay: number,
  endOfDay: number,
): ReadonlyArray<ScheduledMatch> {
  return schedule.filter((m) => m.time >= startOfDay && m.time < endOfDay);
}

function ScheduledMatchList({
  title,
  matches,
  includeDate,
  isToday,
  ref,
}: {
  title: string;
  matches: ReadonlyArray<ScheduledMatch>;
  includeDate: boolean;
  isToday?: boolean;
  ref?: Ref<HTMLDivElement>;
}) {
  const titleElement = (
    <Title ref={ref} order={3}>
      {isToday === true ? <u>{title}</u> : title}
    </Title>
  );
  return (
    <Stack p="md" bg={isToday ? "var(--mantine-primary-color-light)" : undefined}>
      {matches.length > 0 ? (
        <CopyToDiscord matches={matches} includeDate={includeDate}>
          {titleElement}
        </CopyToDiscord>
      ) : (
        titleElement
      )}
      {matches.length > 0
        ? matches.map((m) => (
          <ScheduledMatchView
            key={m.name + m.time.toString()}
            match={m}
            includeDate={includeDate}
          />
        ))
        : "No matches found!"}
    </Stack>
  );
}

export default function Schedule({ schedule }: Props) {
  const todayRef = useRef<HTMLDivElement>(null);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  const weekBeforeYesterday = new Date();
  weekBeforeYesterday.setDate(weekBeforeYesterday.getDate() - 8);

  const startOfToday = Math.round(new Date().setHours(0, 0, 0, 0) / 1000);
  const startOfYesterday = Math.round(yesterday.setHours(0, 0, 0, 0) / 1000);
  const startOfTomorrow = Math.round(tomorrow.setHours(0, 0, 0, 0) / 1000);
  const startOfDayAfter = Math.round(dayAfter.setHours(0, 0, 0, 0) / 1000);
  const startOfWeekBeforeYesterday = Math.round(
    weekBeforeYesterday.setHours(0, 0, 0, 0) / 1000,
  );

  const earlierMatches = getMatches(
    schedule,
    startOfWeekBeforeYesterday,
    startOfYesterday,
  );
  const yesterdayMatches = getMatches(schedule, startOfYesterday, startOfToday);
  const todayMatches = getMatches(schedule, startOfToday, startOfTomorrow);
  const tomorrowMatches = getMatches(
    schedule,
    startOfTomorrow,
    startOfDayAfter,
  );
  const laterMatches = getMatches(schedule, startOfDayAfter, Infinity);

  useEffect(() => {
    if (todayRef.current != null) {
      todayRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, []);
  return (
    <Container>
      <Stack>
        <Alert title="All times and dates are in your local timezone.">
          Data is synced from the following sheets once per hour
          <List>
            <List.Item>
              <Anchor
                size="sm"
                href="https://docs.google.com/spreadsheets/d/1OocDHEbrJC3BqO8qrPFCYxyy2nzqAaTT6Hmix076Ea0/edit?gid=1881722267#gid=1881722267"
                target="_blank"
              >
                Underground Season 2 schedule
              </Anchor>
            </List.Item>

            <List.Item>
              <Anchor
                size="sm"
                href="https://docs.google.com/spreadsheets/d/1oQktL5q8eVWrI_Zbacjv-supFhuQI4h63tiVcMkan4E/edit?gid=1916787881#gid=1916787881"
                target="_blank"
              >
                Spicy League schedule
              </Anchor>
            </List.Item>
            <List.Item>
              <Anchor
                size="sm"
                href="https://docs.google.com/spreadsheets/d/1FuvQLFIM38sZKXF4hnMtLWjWBo1jOokM659N-BRu2uk/edit?gid=0#gid=0"
                target="_blank"
              >
                Offseason schedule
              </Anchor>
            </List.Item>
          </List>
          To force an immediate sync,{" "}
          <Anchor size="sm" onClick={async () => await revalidateSchedule()}>
            click here.
          </Anchor>
        </Alert>
        <Card p={0}>
          <Stack gap={0}>
            <ScheduledMatchList
              title="Previous week"
              matches={earlierMatches}
              includeDate={true}
            />
            <ScheduledMatchList
              title="Yesterday"
              matches={yesterdayMatches}
              includeDate={false}
            />
            <ScheduledMatchList
              title="Today"
              matches={todayMatches}
              includeDate={false}
              isToday={true}
              ref={todayRef}
            />
            <ScheduledMatchList
              title="Tomorrow"
              matches={tomorrowMatches}
              includeDate={false}
            />
            <ScheduledMatchList
              title="Later"
              matches={laterMatches}
              includeDate={true}
            />
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
