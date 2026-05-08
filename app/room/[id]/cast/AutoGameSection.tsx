import { Stack, Accordion, Button } from "@mantine/core";
import { useRef, useState } from "react";
import CaptureRegionSelectionModal from "./CaptureRegionSelectionModal";

type Props = { dummy?: string };

export default function AutoGameSection({}: Props) {
  const [capture, setCapture] = useState<null | MediaStream>(null);
  const videoRef = useRef<null | HTMLVideoElement>(null);
  const canvasRef = useRef<null | HTMLCanvasElement>(null);
  const [snapshotUrl, setSnapshotUrl] = useState<null | string>(null);
  return (
    <Accordion.Item value="autogame">
      <Accordion.Control>Auto Game Detection</Accordion.Control>
      <Accordion.Panel>
        <Stack>
          <Button
            onClick={async () => {
              try {
                const captureStream =
                  await navigator.mediaDevices.getDisplayMedia({
                    video: {
                      frameRate: 30,
                    },
                    audio: false,
                  });
                setCapture(captureStream);
                const video = document.createElement("video");
                video.srcObject = captureStream;
                await new Promise((resolve) => {
                  video.onloadedmetadata = resolve;
                });
                await video.play();
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                videoRef.current = video;
                canvasRef.current = canvas;
              } catch (err) {
                console.error(`Error: ${err}`);
              }
            }}
          >
            Capture Discord
          </Button>
          <Button
            onClick={async () => {
              const video = videoRef.current;
              const canvas = canvasRef.current;
              if (capture == null || video == null || canvas == null) {
                return;
              }
              const context2d = canvas.getContext("2d");
              if (context2d == null) {
                return;
              }
              context2d.drawImage(video, 0, 0, canvas.width, canvas.height);
              setSnapshotUrl(canvas.toDataURL());
            }}
          >
            Choose regions
          </Button>
          <Button
            onClick={() => {
              const video = videoRef.current;
              const canvas = canvasRef.current;
              if (capture == null || video == null || canvas == null) {
                return;
              }
              const context2d = canvas.getContext("2d");
              if (context2d == null) {
                return;
              }
              context2d.drawImage(video, 0, 0, canvas.width, canvas.height);
              canvas.toBlob((blob) => {
                if (blob == null) {
                  return;
                }
                const board = new ClipboardItem({ "image/png": blob });
                navigator.clipboard.write([board]);
              });
            }}
          >
            Screenshot
          </Button>
        </Stack>
        {snapshotUrl != null && (
          <CaptureRegionSelectionModal snapshotUrl={snapshotUrl} />
        )}
      </Accordion.Panel>
    </Accordion.Item>
  );
}
