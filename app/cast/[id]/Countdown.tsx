import { Button, NumberInput, Stack } from "@mantine/core";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import sendChat from "./sendChat";

export default function Countdown() {
    const { id } = useParams<{ id: string }>();
    const useBot = useSearchParams().get('use_bot') === 'true';

    const [analysisSeconds, setAnalysisSeconds] = useState<string | number>(60);

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
        if (typeof analysisSeconds === 'string' || analysisSeconds < 10) {
            throw new Error('expected seconds to be number');
        }

        setIsRunning(true);
        cancelRef.current = false;

        const sequence = [
            { text: '4', delay: 1000 },
            { text: '3', delay: 1000 },
            { text: '2', delay: 1000 },
            { text: '1', delay: 1000 },
            { text: 'REVEAL!', delay: 1000 },
            { text: '5', delay: (analysisSeconds - 5) * 1000 },
            { text: '4', delay: 1000 },
            { text: '3', delay: 1000 },
            { text: '2', delay: 1000 },
            { text: '1', delay: 1000 },
            { text: 'START!', delay: 1000 },
        ];

        sendChat(id, '5');
        for (const { text, delay } of sequence) {
            if (cancelRef.current) {
                break;
            }
            await new Promise(resolve => {
                timeoutRef.current = setTimeout(resolve, delay);
            });
            if (cancelRef.current) {
                break;
            }
            sendChat(id, text);
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
        <Stack>
            <NumberInput
                label="Scanning time (min 10 seconds)"
                value={analysisSeconds} min={10}
                onChange={setAnalysisSeconds}
                disabled={useBot || isRunning}
            />
            {isRunning
                ? <Button onClick={cancelSequence}>Cancel Countdown</Button>
                : <Button disabled={useBot || typeof analysisSeconds === 'string' || analysisSeconds < 10} onClick={startSequence}>Start Countdown</Button>
            }
        </Stack>
    );
}