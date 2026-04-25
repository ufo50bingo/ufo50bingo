import { useState } from "react";
import { TBoard, Change } from "./parseBingosyncData";
import InProgressBoard from "./InProgressBoard";
import { Slider, Stack } from "@mantine/core";

type Props = {
  finalBoard: TBoard;
  changes: ReadonlyArray<Change>;
  startTime: number;
};

export default function WatchBoard({ finalBoard, changes, startTime }: Props) {
  const maxSeekMs = Math.max(changes[changes.length - 1].time - startTime, 0);
  const [seekMs, setSeekMs] = useState(maxSeekMs);
  return (
    <Stack>
      <InProgressBoard
        finalBoard={finalBoard}
        changes={changes}
        startTime={startTime}
        seekMs={seekMs}
      />
      <Slider
        min={0}
        max={maxSeekMs}
        label={(value) => value.toFixed(1)}
        value={seekMs}
        onChange={setSeekMs}
        step={0.1}
        styles={{ markLabel: { display: "none" } }}
      />
    </Stack>
  );
}
