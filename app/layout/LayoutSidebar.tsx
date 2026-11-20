"use client";

import {
  Box,
  Button,
  CloseButton,
  Group,
  Menu,
  NumberInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import WidgetEditor from "./WidgetEditor";
import type { WidgetChangeHandler } from "./WidgetEditor";
import { WIDGET_TYPES, getWidgetLabel } from "./widgetInfo";
import type { WidgetType } from "./widgetInfo";
import type { Widget } from "./widgetTypes";

const MIN_CANVAS_SIZE = 1;
const MAX_CANVAS_SIZE = 3840;

type Props = {
  name: string;
  onNameChange: (name: string) => void;
  canvasWidth: number;
  canvasHeight: number;
  onCanvasSizeChange: (width: number, height: number) => void;
  onAddWidget: (type: WidgetType) => void;
  selectedWidgets: ReadonlyArray<Widget>;
  onDeselect: () => void;
  onWidgetChange: WidgetChangeHandler;
};

export default function LayoutSidebar({
  name,
  onNameChange,
  canvasWidth,
  canvasHeight,
  onCanvasSizeChange,
  onAddWidget,
  selectedWidgets,
  onDeselect,
  onWidgetChange,
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
          onAddWidget={onAddWidget}
        />
      ) : (
        <SelectionProperties
          widgets={selectedWidgets}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          onDeselect={onDeselect}
          onWidgetChange={onWidgetChange}
        />
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
  onAddWidget,
}: Omit<Props, "selectedWidgets" | "onDeselect" | "onWidgetChange">) {
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
      <Menu position="bottom-start">
        <Menu.Target>
          <Button>Add widget</Button>
        </Menu.Target>
        <Menu.Dropdown>
          {WIDGET_TYPES.map((type) => (
            <Menu.Item key={type} onClick={() => onAddWidget(type)}>
              {getWidgetLabel(type)}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
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

function SelectionProperties({
  widgets,
  canvasWidth,
  canvasHeight,
  onDeselect,
  onWidgetChange,
}: {
  widgets: ReadonlyArray<Widget>;
  canvasWidth: number;
  canvasHeight: number;
  onDeselect: () => void;
  onWidgetChange: WidgetChangeHandler;
}) {
  const widget = widgets.length === 1 ? widgets[0] : null;

  const header = (
    <Group justify="space-between" wrap="nowrap">
      <Title order={4}>
        Edit {widget != null ? getWidgetLabel(widget.type) : "Widget"}
      </Title>
      <CloseButton aria-label="Deselect" onClick={onDeselect} />
    </Group>
  );

  return (
    <Stack>
      {header}
      {widget != null ? (
        <WidgetEditor
          widget={widget}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          onChange={onWidgetChange}
        />
      ) : (
        <Text size="sm" c="dimmed">
          TODO
        </Text>
      )}
    </Stack>
  );
}
