import { Alert, Button, Drawer, Stack } from "@mantine/core";
import ColorSelector from "../common/ColorSelector";
import { useState } from "react";
import { BingosyncColor, TBoard } from "@/app/matches/parseBingosyncData";
import changeColor from "./changeColor";

type Props = {
  id: string;
  board: TBoard;
  editingIndex: number;
  setEditingIndex: (newEditingIndex: null | number) => unknown;
};

export default function EditSquare({
  id,
  board,
  editingIndex,
  setEditingIndex,
}: Props) {
  const square = board[editingIndex];
  const [newColor, setNewColor] = useState<null | BingosyncColor>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isClearing = square.color !== "blank";

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
          <Drawer.Title>{isClearing ? "Clear" : "Assign"} Square</Drawer.Title>
          <Drawer.CloseButton />
        </Drawer.Header>
        <Drawer.Body>
          <Stack>
            <Alert
              color="red"
              title="Please be absolutely certain you need to manually change this square. If you aren't sure, carefully review the stream VOD or ask the players to pause."
            />
            <span>
              <strong>{square.name}</strong>
            </span>
            {!isClearing && (
              <ColorSelector
                label="New color"
                color={newColor}
                setColor={setNewColor}
              />
            )}
            <Button
              disabled={isSaving || (!isClearing && newColor == null)}
              onClick={async () => {
                setIsSaving(true);
                const color = isClearing ? square.color : nullthrows(newColor);
                try {
                  await changeColor(id, editingIndex, color, isClearing);
                  setEditingIndex(null);
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              Confirm {isClearing ? "Clear" : "Assignment"}
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
