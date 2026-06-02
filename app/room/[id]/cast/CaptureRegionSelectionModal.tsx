import { Rnd } from "react-rnd";
import { Modal } from "@mantine/core";
import { useState, useCallback } from "react";
import { SnapshotInfo } from "./AutoGameSection";

export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Props = {
  snapshotInfo: SnapshotInfo;
  cropRect: CropRect;
  setCropRect: (newCropRect: CropRect) => unknown;
  onClose: () => unknown;
};

export default function CaptureRegionSelectionModal({
  snapshotInfo,
  cropRect,
  setCropRect,
  onClose,
}: Props) {
  const [imgSize, setImgSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const imgCallback = useCallback((img: HTMLImageElement | null) => {
    if (!img) return;

    const measure = () => {
      setImgSize({ width: img.clientWidth, height: img.clientHeight });
    };

    const observer = new ResizeObserver(measure);
    observer.observe(img);

    if (img.complete) {
      measure();
    } else {
      img.addEventListener("load", measure);
    }
  }, []);

  return (
    <Modal
      fullScreen={true}
      onClose={onClose}
      opened={true}
      size="xl"
      withCloseButton={true}
      title="Choose region"
    >
      <div style={{ position: "relative", display: "inline-block" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgCallback}
          src={snapshotInfo.url}
          style={{ display: "block", maxWidth: "100%" }}
          alt="screenshot"
        />

        {imgSize != null && (
          <Rnd
            lockAspectRatio={16 / 9}
            size={{
              width: cropRect.width * imgSize.width,
              height: cropRect.height * imgSize.height,
            }}
            position={{
              x: cropRect.x * imgSize.width,
              y: cropRect.y * imgSize.height,
            }}
            bounds="parent"
            onDragStop={(e, d) => {
              setCropRect((r) => ({
                ...r,
                x: d.x / imgSize.width,
                y: d.y / imgSize.height,
              }));
            }}
            onResizeStop={(e, dir, ref, delta, position) => {
              setCropRect({
                x: position.x / imgSize.width,
                y: position.y / imgSize.height,
                width: parseInt(ref.style.width) / imgSize.width,
                height: parseInt(ref.style.height) / imgSize.height,
              });
            }}
            style={{
              border: "2px solid red",
              background: "rgba(255,0,0,0.1)",
            }}
          />
        )}
      </div>
    </Modal>
  );
}
