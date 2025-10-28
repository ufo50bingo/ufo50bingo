import { TextInput } from "@mantine/core";
import { useState } from "react";

type Props = {
    label: string;
    initialDurationMs: number;
    onChange: (newMs: number) => unknown;
    showHrs: boolean;
}

export default function DurationInput({ label, initialDurationMs, onChange, showHrs }: Props) {
    const [duration, setDuration] = useState(msToStr(initialDurationMs, showHrs));
    return (
        <TextInput
            label={label}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            value={duration}
            onChange={(event) => {
                const newStr = formatInput(event.currentTarget.value, showHrs);
                onChange(strToMs(newStr, showHrs));
                setDuration(newStr);
            }}
            onBlur={() => {
                // clamp value so it's non-negative, and 99 mins becomes 1 hr 39 mins
                // don't need to call onChange again because it already did the clamping
                setDuration(msToStr(strToMs(duration, showHrs), showHrs));
            }}
            placeholder={showHrs ? "00:00:00" : "00:00"}
        />
    );
}

function msToStr(durationMs: number, showHrs: boolean): string {
    const totalSeconds = Math.round(durationMs / 1000);
    let remainingSeconds = clampSecs(totalSeconds, showHrs);
    let hrs = null;
    let hrsStr = '';
    if (showHrs) {
        hrs = Math.floor(remainingSeconds / 3600);
        remainingSeconds = remainingSeconds - hrs * 3600;
        hrsStr = hrs.toString().padStart(2, '0') + ':';
    }
    const mins = Math.floor(remainingSeconds / 60);
    remainingSeconds = remainingSeconds - mins * 60;
    return `${hrsStr}${mins.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function strToMs(durationStr: string, showHrs: boolean): number {
    let hrs = '0';
    let mins = '0';
    let secs = '0';
    if (showHrs) {
        [hrs, mins, secs] = durationStr.split(':');
    } else {
        [mins, secs] = durationStr.split(':');
    }
    return (Number(hrs) * 3600 + Number(mins) * 60 + Number(secs)) * 1000;
}

function clampSecs(input: number, showHrs: boolean): number {
    return showHrs
        ? Math.min(Math.max(0, input), 99 * 3600 + 59 * 60 + 59)
        : Math.min(Math.max(0, input), 99 * 60 + 59);
}

function formatInput(input: string, showHrs: boolean): string {
    // Remove non-digit characters
    const digits = input.replace(/\D/g, '').slice(showHrs ? -6 : -4); // max 6 digits for HHMMSS, 4 digits for MMSS
    // Pad with leading zeros if needed
    const padded = digits.padStart(showHrs ? 6 : 4, '0');
    let hrsStr = '';
    if (showHrs) {
        const hours = padded.slice(0, 2);
        hrsStr = hours + ':';
    }
    const minutes = showHrs ? padded.slice(2, 4) : padded.slice(0, 2);
    const seconds = showHrs ? padded.slice(4, 6) : padded.slice(2, 4);
    return `${hrsStr}${minutes}:${seconds}`;
}