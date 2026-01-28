"use client";

import "@mantine/dates/styles.css";
import { Card, Container, Select, Stack, Text, Title } from "@mantine/core";
import { DatePicker, TimePicker } from "@mantine/dates";
import { useState } from "react";
import useLocalEnum from "../localStorage/useLocalEnum";
import dayjs from "dayjs";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advancedFormat from "dayjs/plugin/advancedFormat.js";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);

const FORMATS = ["F", "f", "s", "t"] as const;
type Format = (typeof FORMATS)[number];

function displayFormat(format: Format, timestamp: dayjs.Dayjs): string {
  switch (format) {
    case "F":
      return timestamp.format("dddd, MMMM Do, YYYY, h:mm A");
    case "f":
      return timestamp.format("MMMM Do, YYYY, h:mm A");
    case "s":
      return timestamp.format("MM/DD/YYYY h:mm A");
    case "t":
      return timestamp.format("h:mm A");
  }
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

  const timestamp = dayjs(`${date} ${time}`);
  const unixtime = timestamp.unix();
  return (
    <Container my="md">
      <Card shadow="sm" padding="sm" radius="md" withBorder>
        <Card.Section withBorder={true} inheritPadding={true} p="md" mt="md">
          <Stack>
            <Title order={1}>Create Discord timestamps</Title>
            <p>
              Choose a date and time in your local timezone to generate a
              Discord timestamp which will be localized to each viewer's
              timezone.
            </p>
            <DatePicker value={date} onChange={setDate} size="xl" />
            <TimePicker
              value={time}
              onChange={setTime}
              size="xl"
              format="12h"
              withDropdown={true}
              hoursStep={1}
              minutesStep={15}
            />
          </Stack>
        </Card.Section>
        <Card.Section withBorder={true} inheritPadding={true} p="md" mt="md">
          <Stack>
            <Select
              size="xl"
              label="Format"
              data={FORMATS.map((fmt) => ({
                value: fmt,
                label: displayFormat(fmt, timestamp),
              }))}
              value={format}
              onChange={(newFormat) => setFormat(newFormat as Format)}
            />
            {date}
            {time}
          </Stack>
        </Card.Section>
        <Card.Section withBorder={true} inheritPadding={true} p="md" mt="md">
          <Text>
            <strong>Time in US East</strong>:{" "}
            {timestamp.tz("America/New_York").format("YYYY-MM-DD h:mm A z")}
          </Text>
        </Card.Section>
      </Card>
    </Container>
  );
}
