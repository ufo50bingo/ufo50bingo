import { Alert, Button, Drawer, SegmentedControl, Stack } from "@mantine/core";
import ColorSelector from "../common/ColorSelector";
import { useState } from "react";
import { FeedColorMark, NewFeedItem } from "@/app/fetchFeed";
import { useServerOffsetContext } from "../ServerOffsetContext";
import { BingosyncColor, COLORS } from "@/app/color";
import BoardState from "@/app/match/[id]/BoardState";

type Props = {
  userId: number;
  squareNames: ReadonlyArray<string>;
  boardState: BoardState;
  editingIndex: number;
  setEditingIndex: (newEditingIndex: null | number) => unknown;
  sendEvents: (newEvent: ReadonlyArray<NewFeedItem>) => Promise<boolean>;
  isLockout: boolean;
};

export default function EditSquare({
  userId,
  squareNames,
  boardState,
  editingIndex,
  setEditingIndex,
  sendEvents,
  isLockout,
}: Props) {
  const [newColor, setNewColor] = useState<null | BingosyncColor>(null);
  const [isSaving, setIsSaving] = useState(false);
  const activeColors = [...boardState.squares[editingIndex]];
  // for non-lockout you have to manually choose whether to clear or mark a color
  const [isClearRaw, setIsClearRaw] = useState(() => activeColors.length > 0);
  const { getServerMsFromClientMs } = useServerOffsetContext();

  const isClear = isLockout ? activeColors.length > 0 : isClearRaw;
  const showColorSelector = !isLockout || !isClear;
  const selectableColors = isClear
    ? activeColors
    : COLORS.filter((color) => !activeColors.includes(color));

  const selectedColor =
    newColor != null && selectableColors.includes(newColor) ? newColor : null;

  return (
    <Drawer.Root
      position="right"
      opened={true}
      onClose={() => setEditingIndex(null)}
      size={300}
    >
      <Drawer.Overlay backgroundOpacity={0} />
      <Drawer.Content style={{ boxShadow: "-0.2em 0 0.4em black" }}>
        <Drawer.Header>
          <Drawer.Title>{isClear ? "Clear" : "Assign"} Square</Drawer.Title>
          <Drawer.CloseButton />
        </Drawer.Header>
        <Drawer.Body>
          <Stack>
            <Alert
              color="red"
              title="Please be absolutely certain you need to manually change this square. If you aren't sure, pause the game and carefully review the VOD."
            />
            <span>
              <strong>{squareNames[editingIndex]}</strong>
            </span>
            {!isLockout && (
              <SegmentedControl
                data={[
                  { label: "Clear color", value: "clear" },
                  { label: "Add color", value: "add" },
                ]}
                value={isClearRaw ? "clear" : "add"}
                onChange={(value) => {
                  setIsClearRaw(value === "clear");
                  setNewColor(null);
                }}
              />
            )}
            {showColorSelector && (
              <ColorSelector
                label={isClear ? "Color to clear" : "New color"}
                color={selectedColor}
                setColor={setNewColor}
                colors={selectableColors}
              />
            )}
            <Button
              disabled={
                isSaving || (showColorSelector && selectedColor == null)
              }
              onClick={async () => {
                setIsSaving(true);
                const color =
                  isLockout && isClear ? activeColors[0] : selectedColor!;
                try {
                  const event: FeedColorMark = {
                    type: "color_mark",
                    userId,
                    time: getServerMsFromClientMs(Date.now()) / 1000,
                    squareIndex: editingIndex,
                    color,
                    isClear,
                  };
                  await sendEvents([event]);
                  setEditingIndex(null);
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              Confirm {isClear ? "Clear" : "Assignment"}
            </Button>
          </Stack>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
}
