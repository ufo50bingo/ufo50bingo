"use client";

import type { FocusEvent } from "react";
import {
  Autocomplete,
  ColorInput,
  Group,
  NumberInput,
  SegmentedControl,
  Stack,
  Switch,
  Textarea,
} from "@mantine/core";
import LayoutFontSelector from "./LayoutFontSelector";
import { BUILT_IN_ICON_SETS } from "../room/[id]/cast/iconSets";
import { isAspectRatioLocked } from "./widgetInfo";
import type { Widget } from "./widgetTypes";

export type WidgetChangeHandler = (widget: Widget) => void;

type Props = {
  widget: Widget;
  canvasWidth: number;
  canvasHeight: number;
  onChange: WidgetChangeHandler;
};

function commitTextOnBlur(value: string, onChange: (value: string) => void) {
  return (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = event.currentTarget.value;
    if (newValue !== value) {
      onChange(newValue);
    }
  };
}

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

      {widget.type === "plain_text" && (
        <Textarea
          key={widget.text}
          label="Text"
          autosize
          minRows={2}
          defaultValue={widget.text}
          onBlur={commitTextOnBlur(widget.text, (text) =>
            onChange({ ...widget, text }),
          )}
        />
      )}

      {widget.type === "board" && (
        <Group grow gap="xs">
          <NumberField
            label="Square padding"
            min={0}
            value={widget.squarePadding}
            onChange={(squarePadding) => onChange({ ...widget, squarePadding })}
          />
          <NumberField
            label="Border width"
            min={0}
            value={widget.borderWidth}
            onChange={(borderWidth) => onChange({ ...widget, borderWidth })}
          />
        </Group>
      )}
      {widget.type === "board" && (
        <Group grow gap="xs">
          <ColorInput
            key={widget.borderColor}
            label="Border color"
            defaultValue={widget.borderColor}
            format="hexa"
            onBlur={commitTextOnBlur(widget.borderColor, (borderColor) =>
              onChange({ ...widget, borderColor }),
            )}
          />
          <ColorInput
            key={widget.blankSquareColor}
            label="Blank square color"
            defaultValue={widget.blankSquareColor}
            format="hexa"
            onBlur={commitTextOnBlur(
              widget.blankSquareColor,
              (blankSquareColor) => onChange({ ...widget, blankSquareColor }),
            )}
          />
        </Group>
      )}

      {"playerNum" in widget && (
        <NumberField
          label="Player number"
          min={1}
          value={widget.playerNum}
          onChange={(playerNum) => onChange({ ...widget, playerNum })}
        />
      )}
      {"recentGameNumber" in widget && (
        <NumberField
          label="Recent game number"
          min={1}
          value={widget.recentGameNumber}
          onChange={(recentGameNumber) =>
            onChange({ ...widget, recentGameNumber })
          }
        />
      )}
      {"generalNumber" in widget && (
        <NumberField
          label="General number"
          min={1}
          value={widget.generalNumber}
          onChange={(generalNumber) => onChange({ ...widget, generalNumber })}
        />
      )}
      {widget.type === "general_icon" && (
        <Autocomplete
          key={widget.iconSet}
          label="Icon set"
          data={BUILT_IN_ICON_SETS}
          defaultValue={widget.iconSet}
          onBlur={commitTextOnBlur(widget.iconSet, (iconSet) =>
            onChange({ ...widget, iconSet }),
          )}
        />
      )}

      <LayoutFontSelector
        font={widget.font}
        setFont={(font) => onChange({ ...widget, font })}
      />
      {"defaultSize" in widget && (
        <NumberField
          label="Font size"
          min={1}
          value={widget.defaultSize}
          onChange={(defaultSize) => onChange({ ...widget, defaultSize })}
        />
      )}
      {"canShrink" in widget && (
        <>
          <Switch
            label="Shrink text to fit"
            checked={widget.canShrink}
            onChange={(event) =>
              onChange({ ...widget, canShrink: event.currentTarget.checked })
            }
          />
          <NumberField
            label="Minimum font size"
            min={1}
            disabled={!widget.canShrink}
            value={widget.minSize}
            onChange={(minSize) => onChange({ ...widget, minSize })}
          />
        </>
      )}

      {"color" in widget && (
        <ColorField
          color={widget.color}
          onChange={(color) => onChange({ ...widget, color })}
        />
      )}

      {"hasDefaultTimer" in widget && (
        <Switch
          label="Show default timer"
          checked={widget.hasDefaultTimer}
          onChange={(event) =>
            onChange({
              ...widget,
              hasDefaultTimer: event.currentTarget.checked,
            })
          }
        />
      )}
      {"showStart" in widget && (
        <Switch
          label="Show start"
          checked={widget.showStart}
          onChange={(event) =>
            onChange({ ...widget, showStart: event.currentTarget.checked })
          }
        />
      )}
      {"hasInsetCount" in widget && (
        <Switch
          label="Show inset count"
          checked={widget.hasInsetCount}
          onChange={(event) =>
            onChange({ ...widget, hasInsetCount: event.currentTarget.checked })
          }
        />
      )}
      {"hasDefaultBackground" in widget && (
        <Switch
          label="Show default background"
          checked={widget.hasDefaultBackground}
          onChange={(event) =>
            onChange({
              ...widget,
              hasDefaultBackground: event.currentTarget.checked,
            })
          }
        />
      )}
      {"showTiebreaker" in widget && (
        <Switch
          label="Show tiebreaker"
          checked={widget.showTiebreaker}
          onChange={(event) =>
            onChange({ ...widget, showTiebreaker: event.currentTarget.checked })
          }
        />
      )}
      {"allowCustomName" in widget && (
        <Switch
          label="Allow custom name"
          checked={widget.allowCustomName}
          onChange={(event) =>
            onChange({
              ...widget,
              allowCustomName: event.currentTarget.checked,
            })
          }
        />
      )}
    </Stack>
  );
}

type WidgetColor = Extract<Widget, { color: unknown }>["color"];

const DEFAULT_CUSTOM_COLOR = "#ffffff";
const DEFAULT_PLAYER_NUM = 1;

function ColorField({
  color,
  onChange,
}: {
  color: WidgetColor;
  onChange: (color: WidgetColor) => void;
}) {
  return (
    <Stack gap={4}>
      <SegmentedControl
        data={[
          { value: "player_color", label: "Player color" },
          { value: "custom_color", label: "Custom color" },
        ]}
        value={color.type}
        onChange={(type) =>
          onChange(
            type === "player_color"
              ? { type: "player_color", playerNum: DEFAULT_PLAYER_NUM }
              : { type: "custom_color", color: DEFAULT_CUSTOM_COLOR },
          )
        }
      />
      {color.type === "player_color" ? (
        <NumberField
          label="Color of player number"
          min={1}
          value={color.playerNum}
          onChange={(playerNum) =>
            onChange({ type: "player_color", playerNum })
          }
        />
      ) : (
        <ColorInput
          key={color.color}
          label="Color"
          defaultValue={color.color}
          format="hexa"
          onBlur={commitTextOnBlur(color.color, (value) =>
            onChange({ type: "custom_color", color: value }),
          )}
        />
      )}
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
  // dragging and resizing can leave long decimals, so show at most one
  const shownValue = Math.round(value * 10) / 10;
  return (
    <NumberInput
      key={value}
      label={label}
      min={min}
      max={max}
      defaultValue={shownValue}
      decimalScale={1}
      disabled={disabled}
      // this only updates the main widget when the input is blurred, so we
      // aren't spamming the history with a million entries as the user types
      onBlur={(event) => {
        const typed = event.currentTarget.value;
        const newValue = Math.min(
          max ?? Infinity,
          Math.max(min ?? -Infinity, Number(typed)),
        );
        // compare to what was shown, so blurring without typing doesn't round
        // the real value
        if (
          typed !== "" &&
          Number.isFinite(newValue) &&
          newValue !== shownValue &&
          newValue !== value
        ) {
          onChange(newValue);
        }
      }}
    />
  );
}
