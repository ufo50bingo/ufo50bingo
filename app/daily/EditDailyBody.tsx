import { useState } from "react";
import { LocalDate } from "./localDate";
import { DailyData } from "./page";
import { Alert, Button, Group, NumberInput, Stack, Textarea, TextInput } from "@mantine/core";
import { fetchBoard } from "../fetchMatchInfo";
import saveDailyBoard from "./saveDailyBoard";

type Props = {
    date: LocalDate;
    dailyData: DailyData;
    onClose: () => unknown;
}

export default function EditDailyBody({ date, dailyData, onClose }: Props) {
    const [title, setTitle] = useState(dailyData.title ?? "");
    const [description, setDescription] = useState(dailyData.description ?? "");
    const [creator, setCreator] = useState(dailyData.creator ?? "");
    const [textBoard, setTextBoard] = useState(() => dailyData.board.join("\n"));
    const [seed, setSeed] = useState<number | string | undefined>(dailyData.seed);

    const board = textBoard.trim().split("\n");
    const lines = board.length;

    const [bingosyncId, setBingosyncId] = useState('');
    return (
        <Stack>
            <TextInput label="Title" value={title} onChange={(event) => setTitle(event.currentTarget.value)} />
            <TextInput label="Creator" value={creator} onChange={(event) => setCreator(event.currentTarget.value)} />
            <Textarea
                label="Description"
                value={description}
                onChange={(event) => setDescription(event.currentTarget.value)}
                autosize={true}
                minRows={2}
                maxRows={5}
            />
            <Group align="end">
                <TextInput
                    label="Optional: Enter Bingosync ID to sync board"
                    value={bingosyncId}
                    onChange={(event) => setBingosyncId(event.currentTarget.value)}
                />
                <Button onClick={async () => {
                    try {
                        const rawBoard = await fetchBoard(bingosyncId);
                        setTextBoard(rawBoard.map(square => square.name).join("\n"));
                    } catch (err) {
                        console.error(err);
                    }
                }}>
                    Sync
                </Button>
            </Group>
            <NumberInput
                label="Seed"
                description="Not used in card generation. Only intended for terminal codes."
                min={0}
                max={999999}
                value={seed}
                onChange={setSeed}
                allowDecimal={false}
            />
            <Textarea
                label="Board"
                description="Each goal should be on a separate line"
                value={textBoard}
                onChange={(event) => setTextBoard(event.currentTarget.value)}
                autosize={true}
                maxRows={10}
                minRows={5}
                spellCheck={false}
            />
            {lines !== 25 && (
                <Alert color="red">
                    Your board has {lines} lines! You must include exactly 25 lines.
                </Alert>
            )}
            <Group justify="end">
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    color="green"
                    disabled={lines !== 25}
                    onClick={async () => {
                        try {
                            let newSeed: number;
                            if (seed == null) {
                                newSeed = Math.ceil(999999 * Math.random());
                            } else if (typeof seed === "string") {
                                newSeed = Number(seed);
                                if (Number.isNaN(newSeed) || newSeed < 0 || newSeed > 999999 || !Number.isInteger(newSeed)) {
                                    newSeed = Math.ceil(999999 * Math.random());
                                }
                            } else {
                                newSeed = seed;
                            }
                            await saveDailyBoard({ board, title, creator, description, seed: newSeed }, date);
                            window.location.reload();
                        } catch (err) {
                            console.error(err);
                        }
                    }}>Save</Button>
            </Group>
        </Stack>
    );
}