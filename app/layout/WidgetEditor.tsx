"use client";

import { Group, NumberInput, Stack } from "@mantine/core";
import { isAspectRatioLocked } from "./widgetInfo";
import type { Widget } from "./widgetTypes";

export type WidgetChangeHandler = (widget: Widget) => void;

type Props = {
  widget: Widget;
  canvasWidth: number;
  canvasHeight: number;
  onChange: WidgetChangeHandler;
};

export default function WidgetEditor({
  widget,
  canvasWidth,
  canvasHeight,
  onChange,
}: Props) {
  const ratio = isAspectRatioLocked(widget.type)
    ? widget.width / widget.height
    : null;

  const spaceWidth = canvasWidth - widget.x;
  const spaceHeight = canvasHeight - widget.y;
  const minWidth = ratio != null ? Math.max(1, ratio) : 1;
  const minHeight = ratio != null ? Math.max(1, 1 / ratio) : 1;
  const maxWidth =
    ratio != null ? Math.min(spaceWidth, spaceHeight * ratio) : spaceWidth;
  const maxHeight =
    ratio != null ? Math.min(spaceHeight, spaceWidth / ratio) : spaceHeight;

  return (
    <Stack>
      <Group grow gap="xs">
        <NumberField
          label="X"
          min={0}
          max={canvasWidth - widget.width}
          value={widget.x}
          onChange={(x) => onChange({ ...widget, x })}
        />
        <NumberField
          label="Y"
          min={0}
          max={canvasHeight - widget.height}
          value={widget.y}
          onChange={(y) => onChange({ ...widget, y })}
        />
        <NumberField
          label="Z"
          value={widget.z}
          onChange={(z) => onChange({ ...widget, z })}
        />
      </Group>
      <Group grow gap="xs">
        <NumberField
          label="Width"
          min={minWidth}
          max={maxWidth}
          value={widget.width}
          onChange={(width) =>
            onChange({
              ...widget,
              width,
              height: ratio != null ? width / ratio : widget.height,
            })
          }
        />
        <NumberField
          label="Height"
          min={minHeight}
          max={maxHeight}
          value={widget.height}
          onChange={(height) =>
            onChange({
              ...widget,
              height,
              width: ratio != null ? height * ratio : widget.width,
            })
          }
        />
      </Group>
    </Stack>
  );
}

function NumberField({
  label,
  min,
  max,
  value,
  disabled,
  onChange,
}: {
  label: string;
  min?: number;
  max?: number;
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <NumberInput
      key={value}
      label={label}
      min={min}
      max={max}
      defaultValue={value}
      disabled={disabled}
      // this only updates the main widget when the input is blurred, so we
      // aren't spamming the history with a million entries as the user types
      onBlur={(event) => {
        const typed = event.currentTarget.value;
        const newValue = Math.min(
          max ?? Infinity,
          Math.max(min ?? -Infinity, Number(typed)),
        );
        if (typed !== "" && Number.isFinite(newValue) && newValue !== value) {
          onChange(newValue);
        }
      }}
    />
  );
}
