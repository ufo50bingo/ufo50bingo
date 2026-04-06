import { Group, Select } from "@mantine/core";
import { Sound, SOUNDS } from "./sounds";
import { useRef } from "react";

type Props = {
    label: string;
    sound: null | Sound;
    setSound: (newSound: null | Sound) => unknown;
};

export default function SoundSelector({ label, sound, setSound }: Props) {
    const soundRef = useRef<HTMLAudioElement | null>(null);
    return (
        <Group gap={4}>
            <Select
                label={label}
                data={Object.keys(SOUNDS)}
                value={sound}
                onChange={(newSoundRaw => {
                    const newSound = newSoundRaw as null | Sound;
                    setSound(newSound);

                    if (soundRef.current != null) {
                        soundRef.current.pause();
                        soundRef.current.currentTime = 0;
                    }

                    if (newSound != null) {
                        const audio = new Audio(SOUNDS[newSound]);
                        soundRef.current = audio;
                        audio.play().catch(err => {
                            console.error("Playback failed:", err);
                        });
                    }
                })}
                clearable={true}
                placeholder="No sound selected"
            />
        </Group>
    );
}