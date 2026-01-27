"use client";

import "@mantine/dates/styles.css";
import { Card, Container, Stack } from "@mantine/core";
import { DateTimePicker, DateTimeStringValue } from "@mantine/dates";
import { useState } from "react";
import useLocalEnum from "../localStorage/useLocalEnum";

export default function TimestampCopier() {
  const [value, setValue] = useState<DateTimeStringValue | null>(null);
  const [format, setFormat] = useLocalEnum({
    key: "timestamp-format",
    options: ["F", "f"],
    defaultValue: "F",
  });
  return (
    <Container my="md">
      <Card shadow="sm" padding="sm" radius="md" withBorder>
        <Stack>
          <DateTimePicker
            size="xl"
            label="Select date and time"
            value={value}
            onChange={setValue}
            dropdownType="modal"
            timePickerProps={{
              withDropdown: true,
              format: "12h",
              hoursStep: 1,
              minutesStep: 15,
              withSeconds: false,
              size: "xl",
              popoverProps: { withinPortal: false },
            }}
          />
          <div>{value}</div>
        </Stack>
      </Card>
    </Container>
  );
}
