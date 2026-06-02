import { Stack, Accordion, Button } from "@mantine/core";
import { useRef, useState } from "react";
import CaptureRegionSelectionModal, {
  CropRect,
} from "./CaptureRegionSelectionModal";
import * as ort from "onnxruntime-web";
import { ORDERED_PROPER_GAMES } from "@/app/goals";

export type SnapshotInfo = {
  url: string;
  width: number;
  height: number;
};

type Props = { dummy?: string };

export default function AutoGameSection({}: Props) {
  const [capture, setCapture] = useState<null | MediaStream>(null);
  const videoRef = useRef<null | HTMLVideoElement>(null);
  const canvasRef = useRef<null | HTMLCanvasElement>(null);
  const [snapshotInfo, setSnapshotInfo] = useState<null | SnapshotInfo>(null);
  const [cropRect, setCropRect] = useState({
    x: 0.1,
    y: 0.1,
    width: 0.4,
    height: 0.3,
  });
  const [isChoosingRegion, setIsChoosingRegion] = useState(false);
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
              setSnapshotInfo({
                url: canvas.toDataURL(),
                width: canvas.width,
                height: canvas.height,
              });
              setCropRect({
                x: 0.1,
                y: 0.1,
                width: 0.4,
                height: (9 / 16) * (canvas.width / canvas.height) * 0.4,
              });
              setIsChoosingRegion(true);
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
              const cropped = cropCanvas(canvas, cropRect);
              cropped.toBlob((blob) => {
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
              const cropped = cropCanvas(canvas, cropRect);
              await loadModel();
              const result = await predict(cropped);
              // console.log(result);
              console.log(getTopPrediction(result));
              console.log(getSortedPredictions(result));
            }}
          >
            Classify
          </Button>
        </Stack>
        {snapshotInfo != null && isChoosingRegion && (
          <CaptureRegionSelectionModal
            snapshotInfo={snapshotInfo}
            cropRect={cropRect}
            setCropRect={setCropRect}
            onClose={() => setIsChoosingRegion(false)}
          />
        )}
      </Accordion.Panel>
    </Accordion.Item>
  );
}

function imageDataToTensor(imageData: ImageData) {
  const { data, width, height } = imageData;

  const float32 = new Float32Array(3 * height * width);

  for (let i = 0; i < height * width; i++) {
    float32[i] = data[i * 4] / 255.0; // R
    float32[i + height * width] = data[i * 4 + 1] / 255.0; // G
    float32[i + height * width * 2] = data[i * 4 + 2] / 255.0; // B
  }

  // (B, C, H, W) — PyTorch convention
  return new ort.Tensor("float32", float32, [1, 3, height, width]);
}

let session: ort.InferenceSession;
async function loadModel() {
  session = await ort.InferenceSession.create("/ufo50_classifier.onnx", {
    executionProviders: ["webgpu", "wasm"],
  });
}

function resizeCanvas(
  source: HTMLCanvasElement,
  width: number,
  height: number,
) {
  const offscreen = document.createElement("canvas");
  offscreen.width = width;
  offscreen.height = height;

  const ctx = offscreen.getContext("2d")!;
  ctx.drawImage(source, 0, 0, width, height);

  return ctx.getImageData(0, 0, width, height);
}

function softmax(logits: Float32Array): Float32Array {
  const expSum = Array.from(logits).reduce((s, v) => s + Math.exp(v), 0);
  return new Float32Array(Array.from(logits).map((v) => Math.exp(v) / expSum));
}

async function predict(canvas: HTMLCanvasElement) {
  if (!session) throw new Error("Model not loaded");

  // 1. Resize to model input
  const resized = resizeCanvas(canvas, 384, 216);

  // 2. Convert to tensor
  const inputTensor = imageDataToTensor(resized);

  const debug = document.createElement("canvas");
  debug.width = 384;
  debug.height = 216;
  debug.getContext("2d")!.putImageData(resized, 0, 0);
  document.body.appendChild(debug);

  // 3. Match ONNX input name (IMPORTANT)
  const inputName = session.inputNames[0];
  const feeds: Record<string, ort.Tensor> = {
    [inputName]: inputTensor, // you may need to change this name
  };

  // 4. Run inference
  const results = await session.run(feeds);

  // 5. Get output (softmax probabilities)
  const output = results[Object.keys(results)[0]];

  return softmax(output.data as Float32Array);
}

const sortedGames = ORDERED_PROPER_GAMES.toSorted();
function getTopPrediction(probs: Float32Array) {
  let maxIndex = 0;

  for (let i = 1; i < probs.length; i++) {
    if (probs[i] > probs[maxIndex]) {
      maxIndex = i;
    }
  }

  return {
    className: sortedGames[maxIndex],
    confidence: probs[maxIndex],
  };
}

function getSortedPredictions(probs: Float32Array) {
  return Array.from(probs)
    .map((prob, i) => ({ className: sortedGames[i], confidence: prob }))
    .sort((a, b) => b.confidence - a.confidence);
}

function cropCanvas(canvas: HTMLCanvasElement, cropRect: CropRect) {
  // crop to the selected region
  const cropX = cropRect.x * canvas.width;
  const cropY = cropRect.y * canvas.height;
  const cropW = cropRect.width * canvas.width;
  const cropH = cropRect.height * canvas.height;

  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = cropW;
  cropCanvas.height = cropH;
  cropCanvas
    .getContext("2d")!
    .drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  return cropCanvas;
}
