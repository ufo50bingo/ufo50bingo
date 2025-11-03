import getDurationText from "@/app/practice/getDurationText";
import { TextInput } from "@mantine/core";
import { useState } from "react";

type Props = {
    label: string;
    initialDurationMs: number;
    onChange: (newMs: number | null) => unknown;
}

const REGEX = /^-?([0-9]+:)?([0-9]+:)?([0-9]+)$/

export default function DurationInput({ label, initialDurationMs, onChange }: Props) {
    const [duration, setDuration] = useState(msToStr(initialDurationMs));
    return (
        <TextInput
            label={label}
            type="tel"
            inputMode="numeric"
            value={duration}
            onChange={(event) => {
                const newStr = event.currentTarget.value;
                onChange(strToMs(newStr));
                setDuration(newStr);
            }}
            placeholder="00:00:00"
        />
    );
}

function msToStr(durationMs: number): string {
    return getDurationText(durationMs, false, true);
}

function strToMs(durationStr: string): null | number {
    const matches = durationStr.match(REGEX);
    if (matches == null) {
        return null;
    }
    const isNegative = durationStr.startsWith("-");
    if (isNegative) {
        durationStr = durationStr.slice(1);
    }
    const split = durationStr.split(':');
    const len = split.length;
    if (len > 3 || len < 1) {
        return null;
    }
    const hrs = len === 3 ? split[0] : '0';
    const mins = len >= 2 ? split[len - 2] : '0';
    const secs = split[len - 1];
    return (Number(hrs) * 3600 + Number(mins) * 60 + Number(secs)) * 1000 * (isNegative ? -1 : 1)
}

// function clampSecs(input: number): number {
//     return Math.min(input, 99 * 3600 + 59 * 60 + 59);
// }

// function formatInput(input: string, showHrs: boolean): string {
//     // Remove non-digit characters
//     const digits = input.replace(/[^0-9\-]*/g, '').slice(showHrs ? -6 : -4); // max 6 digits for HHMMSS, 4 digits for MMSS
//     // Pad with leading zeros if needed
//     const padded = digits.padStart(showHrs ? 6 : 4, '0');
//     let hrsStr = '';
//     if (showHrs) {
//         const hours = padded.slice(0, 2);
//         hrsStr = hours + ':';
//     }
//     const minutes = showHrs ? padded.slice(2, 4) : padded.slice(0, 2);
//     const seconds = showHrs ? padded.slice(4, 6) : padded.slice(2, 4);
//     return `${hrsStr}${minutes}:${seconds}`;
// }