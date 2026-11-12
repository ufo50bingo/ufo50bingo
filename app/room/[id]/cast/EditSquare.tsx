import { Alert, Button, Drawer, Stack } from "@mantine/core";
import ColorSelector from "../common/ColorSelector";
import { useState } from "react";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { FeedColorMark, NewFeedItem } from "@/app/fetchFeed";
import { useServerOffsetContext } from "../ServerOffsetContext";

type Props = {
  userId: number;
  squareNames: ReadonlyArray<string>;
  squareColors: ReadonlyArray<ReadonlyArray<BingosyncColor>>;
  editingIndex: number;
  setEditingIndex: (newEditingIndex: null | number) => unknown;
  sendEvent: (newEvent: NewFeedItem) => Promise<boolean>;
};

export default function EditSquare({
  userId,
  squareNames,
  squareColors,
  editingIndex,
  setEditingIndex,
  sendEvent,
}: Props) {
  const [newColor, setNewColor] = useState<null | BingosyncColor>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { getServerMsFromClientMs } = useServerOffsetContext();

  // TODO: Support non-lockout
  const isClear = squareColors[editingIndex].length > 0;

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
              title="Please be absolutely certain you need to manually change this square. If you aren't sure, carefully review the stream VOD or ask the players to pause."
            />
            <span>
              <strong>{squareNames[editingIndex]}</strong>
            </span>
            {!isClear && (
              <ColorSelector
                label="New color"
                color={newColor}
                setColor={setNewColor}
              />
            )}
            <Button
              disabled={isSaving || (!isClear && newColor == null)}
              onClick={async () => {
                setIsSaving(true);
                // TODO: Handle non-lockout
                const color = isClear
                  ? squareColors[editingIndex][0]
                  : nullthrows(newColor);
                try {
                  const event: FeedColorMark = {
                    type: "color_mark",
                    userId,
                    time: getServerMsFromClientMs(Date.now()) / 1000,
                    squareIndex: editingIndex,
                    color,
                    isClear,
                  };
                  await sendEvent(event);
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

function nullthrows(color: null | BingosyncColor): BingosyncColor {
  if (color == null) {
    throw new Error("Must select a color before confirming!");
  }
  return color;
}
