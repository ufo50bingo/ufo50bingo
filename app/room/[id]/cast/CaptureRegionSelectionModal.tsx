import { Rnd } from "react-rnd";
import { Modal } from "@mantine/core";
import { useState } from "react";

type Props = {
  snapshotUrl: string;
};

export default function CaptureRegionSelectionModal({ snapshotUrl }: Props) {
  // TODO: Add button for choosing more capture regions
  // maybe sync with number of players?
  const [cropRect, setCropRect] = useState({
    x: 100,
    y: 100,
    width: 400,
    height: 300,
  });
  return (
    <Modal
      fullScreen={true}
      onClose={() => {}}
      opened={true}
      size="xl"
      withCloseButton={true}
      title="Choose region"
    >
      <div
        style={{
          position: "relative",
          display: "inline-block",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={snapshotUrl}
          style={{
            display: "block",
            maxWidth: "100%",
          }}
          alt="screenshot"
        />

        <Rnd
          size={{
            width: cropRect.width,
            height: cropRect.height,
          }}
          position={{
            x: cropRect.x,
            y: cropRect.y,
          }}
          bounds="parent"
          onDragStop={(e, d) => {
            setCropRect((r) => ({
              ...r,
              x: d.x,
              y: d.y,
            }));
          }}
          onResizeStop={(e, dir, ref, delta, position) => {
            setCropRect({
              x: position.x,
              y: position.y,
              width: parseInt(ref.style.width),
              height: parseInt(ref.style.height),
            });
          }}
          style={{
            border: "2px solid red",
            background: "rgba(255,0,0,0.1)",
          }}
        />
      </div>
    </Modal>
  );
}
