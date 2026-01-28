"use client";

import "@mantine/dates/styles.css";
import {
  Alert,
  Button,
  Card,
  Container,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { DatePicker, TimePicker } from "@mantine/dates";
import { useRef, useState } from "react";
import useLocalEnum from "../localStorage/useLocalEnum";
import dayjs from "dayjs";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advancedFormat from "dayjs/plugin/advancedFormat.js";
import {
  IconAlertSquareRounded,
  IconBrandDiscordFilled,
} from "@tabler/icons-react";
import { Metadata } from "next";
import { useMediaQuery } from "@mantine/hooks";
import useLocalBool from "../localStorage/useLocalBool";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);

export const metadata: Metadata = {
  title: "UFO 50 Bingo Timestamps",
  description: "Create timestamps to paste into Discord",
};

const FORMATS = ["F", "f", "s", "t"] as const;
type Format = (typeof FORMATS)[number];

function getFormatStr(format: Format): string {
  switch (format) {
    case "F":
      return "dddd, MMMM Do, YYYY, h:mm A";
    case "f":
      return "MMMM Do, YYYY, h:mm A";
    case "s":
      return "MM/DD/YYYY h:mm A";
    case "t":
      return "h:mm A";
  }
}

function displayFormat(format: Format, timestamp: dayjs.Dayjs): string {
  return timestamp.format(getFormatStr(format));
}

const now = dayjs();
export default function TimestampCopier() {
  const [date, setDate] = useState<string | null>(now.format("YYYY-MM-DD"));
  const [time, setTime] = useState<string | undefined>(now.format("HH:mm"));
  const [format, setFormat] = useLocalEnum({
    key: "timestamp-format",
    options: FORMATS,
    defaultValue: "F",
  });
  const [is12Hour, setIs12Hour] = useLocalBool({
    key: "timestamp-12-hour",
    defaultValue: true,
  });

  const isMobile = useMediaQuery("(max-width: 525px)");
  const timestamp = dayjs(`${date}T${time}`);
  const hoursRef = useRef<HTMLInputElement>(null);

  const body = (
    <Stack>
      <Title order={1}>Create Discord timestamps</Title>
      <Text size="lg">
        Choose a date and time in your local timezone ({dayjs().format("z")}) to
        generate a Discord timestamp which will be localized to each viewer's
        timezone.
      </Text>
      <Stack align="center">
        <DatePicker
          value={date}
          onChange={(newDate) => {
            setDate(newDate);
            hoursRef.current?.focus();
          }}
          size="lg"
          weekendDays={[]}
          firstDayOfWeek={0}
        />
        <TimePicker
          hoursRef={hoursRef}
          key={is12Hour ? "12" : "24"}
          value={time}
          onChange={setTime}
          size="lg"
          format={is12Hour ? "12h" : "24h"}
          withDropdown={!isMobile}
          hoursStep={1}
          minutesStep={15}
        />
      </Stack>
      <Select
        allowDeselect={false}
        size="lg"
        label="Format"
        data={FORMATS.map((fmt) => ({
          value: fmt,
          label: displayFormat(fmt, timestamp),
        }))}
        value={format}
        onChange={(newFormat) => setFormat(newFormat as Format)}
      />
      <Button
        size="lg"
        color="indigo"
        leftSection={<IconBrandDiscordFilled size={40} />}
        onClick={() => {
          navigator.clipboard.writeText(`<t:${timestamp.unix()}:${format}>`);
        }}
      >
        Copy Discord Timestamp
      </Button>
      <Text size="lg">
        Time in{" "}
        <u>
          <strong>US East</strong>
        </u>
        : {timestamp.tz("America/New_York").format(getFormatStr(format))}
      </Text>
      {format === "t" && (
        <Alert variant="light" color="yellow" icon={<IconAlertSquareRounded />}>
          The time-only format is not recommended, because it may represent
          different dates for viewers in different timezones. For example, 10 PM
          in your timezone may be 6 AM the next day in another user's timezone.
        </Alert>
      )}
      <Select
        size="lg"
        label="Clock Type"
        value={is12Hour ? "12 hour (AM/PM)" : "24 hour"}
        onChange={(val) => setIs12Hour(val === "12 hour (AM/PM)")}
        data={["12 hour (AM/PM)", "24 hour"]}
      />
    </Stack>
  );
  return isMobile ? (
    body
  ) : (
    <Container my="md">
      <Card shadow="sm" padding="sm" radius="md" withBorder>
        <Card.Section withBorder={true} inheritPadding={true} p="md">
          {body}
        </Card.Section>
      </Card>
    </Container>
  );
}
