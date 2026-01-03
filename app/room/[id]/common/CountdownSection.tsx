import {
  Accordion,
  Alert,
  Button,
  Checkbox,
  NumberInput,
  Stack,
  Tooltip,
} from "@mantine/core";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import sendChat from "./sendChat";
import { RoomView } from "../roomCookie";

type Props = {
  view: RoomView;
};

const REVEAL_STEP = "REVEAL!";
const START_STEPS = [
  { text: "Start in 5", delay: 1000 },
  { text: "4", delay: 1000 },
  { text: "3", delay: 1000 },
  { text: "2", delay: 1000 },
  { text: "1", delay: 1000 },
  { text: "START!", delay: null },
];

export default function CountdownSection({ view }: Props) {
  const { id } = useParams<{ id: string }>();

  const [analysisSeconds, setAnalysisSeconds] = useState<string | number>(60);
  const [skipReveal, setSkipReveal] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const cancelRef = useRef(false);
  const timeoutRef = useRef<null | NodeJS.Timeout>(null);
  useEffect(() => {
    // Cleanup on unmount: cancel any running sequence and clear timeout
    return () => {
      cancelRef.current = true;
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  const startSequence = async () => {
    if (typeof analysisSeconds === "string" || analysisSeconds < 10) {
      throw new Error("expected seconds to be number");
    }

    setIsRunning(true);
    cancelRef.current = false;

    const sequence = skipReveal
      ? START_STEPS
      : [
          { text: "Reveal in 5", delay: 1000 },
          { text: "4", delay: 1000 },
          { text: "3", delay: 1000 },
          { text: "2", delay: 1000 },
          { text: "1", delay: 1000 },
          { text: REVEAL_STEP, delay: (analysisSeconds - 5) * 1000 },
          ...START_STEPS,
        ];

    for (const { text, delay } of sequence) {
      if (cancelRef.current) {
        break;
      }
      sendChat(id, text);
      if (delay != null) {
        await new Promise((resolve) => {
          timeoutRef.current = setTimeout(resolve, delay);
        });
      }
      if (cancelRef.current) {
        break;
      }
    }
    setIsRunning(false);
    timeoutRef.current = null;
  };
  const cancelSequence = () => {
    cancelRef.current = true;
    setIsRunning(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };
  return (
    <Accordion.Item value="countdown">
      <Accordion.Control>Start Countdown</Accordion.Control>
      <Accordion.Panel>
        <Stack>
          <Alert color="yellow" title="WARNING!">
            You should not minimize your browser after starting a countdown!
            {view === "play" && (
              <>
                <br />
                <br />
                If your game has a caster, please let the caster start the
                countdown instead!
              </>
            )}
          </Alert>
          <Tooltip
            label={
              <>
                If checked, the Reveal step will be skipped.
                <br />
                Players will only see "
                {START_STEPS.map((step) => step.text).join(", ")}"
                <br />
                Use this if you are unpausing, or if your variant does not
                include an analysis period before playing.
              </>
            }
          >
            <Checkbox
              checked={skipReveal}
              onChange={(event) => setSkipReveal(event.currentTarget.checked)}
              label="Skip reveal"
              disabled={isRunning}
            />
          </Tooltip>
          <NumberInput
            label="Scanning time (min 10 seconds)"
            value={analysisSeconds}
            min={10}
            onChange={setAnalysisSeconds}
            disabled={isRunning || skipReveal}
          />
          {isRunning ? (
            <Button onClick={cancelSequence}>Cancel Countdown</Button>
          ) : (
            <Button
              disabled={
                typeof analysisSeconds === "string" || analysisSeconds < 10
              }
              onClick={startSequence}
            >
              Start Countdown
            </Button>
          )}
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
