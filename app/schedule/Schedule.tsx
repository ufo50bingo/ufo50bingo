import { Container, Card, Stack, Title, Alert, Anchor } from "@mantine/core";
import { ScheduledMatch } from "./fetchSchedule";
import ScheduledMatchView from "./ScheduledMatchView";
import { revalidateSchedule } from "./revalidateSchedule";
import { CopyToDiscord } from "./CopyToDiscord";

type Props = {
  schedule: ReadonlyArray<ScheduledMatch>;
};

function getMatches(
  schedule: ReadonlyArray<ScheduledMatch>,
  startOfDay: number,
  endOfDay: number
): ReadonlyArray<ScheduledMatch> {
  return schedule.filter((m) => m.time >= startOfDay && m.time < endOfDay);
}

function ScheduledMatchList({
  title,
  matches,
  includeDate,
}: {
  title: string;
  matches: ReadonlyArray<ScheduledMatch>;
  includeDate: boolean;
}) {
  const titleElement = <Title order={3}>{title}</Title>;
  return (
    <>
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
    </>
  );
}

export default function Schedule({ schedule }: Props) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);

  const startOfToday = Math.round(new Date().setHours(0, 0, 0, 0) / 1000);
  const startOfYesterday = Math.round(yesterday.setHours(0, 0, 0, 0) / 1000);
  const startOfTomorrow = Math.round(tomorrow.setHours(0, 0, 0, 0) / 1000);
  const startOfDayAfter = Math.round(dayAfter.setHours(0, 0, 0, 0) / 1000);

  const yesterdayMatches = getMatches(schedule, startOfYesterday, startOfToday);
  const todayMatches = getMatches(schedule, startOfToday, startOfTomorrow);
  const tomorrowMatches = getMatches(
    schedule,
    startOfTomorrow,
    startOfDayAfter
  );
  const laterMatches = getMatches(schedule, startOfDayAfter, Infinity);
  return (
    <Container>
      <Stack>
        <Alert title="All times and dates are in your local timezone.">
          Data is synced from the{" "}
          <Anchor
            size="sm"
            href="https://docs.google.com/spreadsheets/d/1FwNEMlF1KPdVADiPP539y2a2mDiyHpmoQclALHK9nCA/edit?gid=0#gid=0"
            target="_blank"
          >
            official Season 2 schedule
          </Anchor>{" "}
          once per hour. To force an immediate sync,{" "}
          <Anchor size="sm" onClick={async () => await revalidateSchedule()}>
            click here.
          </Anchor>
        </Alert>
        <Card>
          <Stack>
            <ScheduledMatchList
              title="Yesterday"
              matches={yesterdayMatches}
              includeDate={false}
            />
            <ScheduledMatchList
              title="Today"
              matches={todayMatches}
              includeDate={false}
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
