"use client";

import {
  Box,
  CloseButton,
  Group,
  NumberInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import type { Widget } from "./widgetTypes";

const MIN_CANVAS_SIZE = 1;
const MAX_CANVAS_SIZE = 3840;

type Props = {
  name: string;
  onNameChange: (name: string) => void;
  canvasWidth: number;
  canvasHeight: number;
  onCanvasSizeChange: (width: number, height: number) => void;
  selectedWidgets: ReadonlyArray<Widget>;
  onDeselect: () => void;
};

export default function LayoutSidebar({
  name,
  onNameChange,
  canvasWidth,
  canvasHeight,
  onCanvasSizeChange,
  selectedWidgets,
  onDeselect,
}: Props) {
  return (
    <Box
      component="aside"
      p="md"
      style={{
        width: 300,
        flexShrink: 0,
        height: "100%",
        overflowY: "auto",
        borderRight: "1px solid var(--mantine-color-default-border)",
      }}
    >
      {selectedWidgets.length === 0 ? (
        <LayoutProperties
          name={name}
          onNameChange={onNameChange}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          onCanvasSizeChange={onCanvasSizeChange}
        />
      ) : (
        <ElementProperties widgets={selectedWidgets} onDeselect={onDeselect} />
      )}
    </Box>
  );
}

function LayoutProperties({
  name,
  onNameChange,
  canvasWidth,
  canvasHeight,
  onCanvasSizeChange,
}: Omit<Props, "selectedWidgets" | "onDeselect">) {
  return (
    <Stack>
      <Title order={4}>Layout</Title>
      <TextInput
        label="Name"
        value={name}
        onChange={(event) => onNameChange(event.currentTarget.value)}
      />
      <Group grow gap="xs">
        <CanvasSizeInput
          label="Width"
          value={canvasWidth}
          onChange={(width) => onCanvasSizeChange(width, canvasHeight)}
        />
        <CanvasSizeInput
          label="Height"
          value={canvasHeight}
          onChange={(height) => onCanvasSizeChange(canvasWidth, height)}
        />
      </Group>
    </Stack>
  );
}

function CanvasSizeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <NumberInput
      label={label}
      suffix=" px"
      value={value}
      min={MIN_CANVAS_SIZE}
      max={MAX_CANVAS_SIZE}
      allowDecimal={false}
      allowNegative={false}
      clampBehavior="strict"
      onChange={(newValue) => {
        // ignore intermediate states such as an empty input
        if (typeof newValue === "number" && newValue >= MIN_CANVAS_SIZE) {
          onChange(newValue);
        }
      }}
    />
  );
}

function ElementProperties({
  widgets,
  onDeselect,
}: {
  widgets: ReadonlyArray<Widget>;
  onDeselect: () => void;
}) {
  const header = (
    <Group justify="space-between" wrap="nowrap">
      <Title order={4}>Edit Element</Title>
      <CloseButton aria-label="Deselect" onClick={onDeselect} />
    </Group>
  );

  return (
    <Stack>
      {header}
      <Text size="sm" c="dimmed">
        TODO
      </Text>
    </Stack>
  );
}
