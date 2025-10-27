import { Accordion, Alert, Button, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { GeneralCounts } from "./CastPage";
import { Square } from "@/app/matches/parseBingosyncData";
import { db } from "@/app/db";

type Props = {
    leftScore: number;
    rightScore: number;
    generalCounts: GeneralCounts;
    generalGoals: ReadonlyArray<Square>;
};

export default function FileSyncSection({ leftScore, rightScore, generalCounts, generalGoals }: Props) {
    const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>();
    useEffect(() => {
        const fetchHandle = async () => {
            try {
                const dirs = await db.directory.toArray();
                if (dirs.length > 0) {
                    setDirHandle(dirs[0].handle);
                }
            } catch { }
        };
        fetchHandle();
    }, []);

    useEffect(() => {
        if (dirHandle != null) {
            writeToFile(dirHandle, leftScore, rightScore, generalCounts, generalGoals);
        }
    }, [dirHandle, leftScore, rightScore, generalCounts, generalGoals]);

    return (
        <Accordion.Item value="advanced">
            <Accordion.Control>
                Advanced OBS Integration
            </Accordion.Control>
            <Accordion.Panel>
                <Stack>
                    <Text size="sm">
                        If you want more advanced OBS integrations, you can sync the data from this page to files on your computer,{' '}
                        and use those files as text sources in OBS.
                    </Text>
                    <Alert color="yellow" title="WARNING!">
                        This may only work in Google Chrome!
                    </Alert>
                    {dirHandle == null
                        ? (
                            <Button
                                onClick={async () => {
                                    try {
                                        const dirHandle = await window.showDirectoryPicker();
                                        setDirHandle(dirHandle);
                                        writeToFile(dirHandle, leftScore, rightScore, generalCounts, generalGoals);
                                        await db.directory.add({ handle: dirHandle });
                                    } catch { }
                                }}>
                                Select sync folder
                            </Button>
                        )
                        : (<>
                            <Text size="sm">Currently syncing to <strong>{dirHandle.name}</strong></Text>
                            <Button
                                color="red"
                                onClick={async () => {
                                    try {
                                        setDirHandle(null);
                                        await db.directory.clear();
                                    } catch { }
                                }}>
                                Stop syncing
                            </Button>
                        </>)
                    }
                </Stack>
            </Accordion.Panel>
        </Accordion.Item>
    );
}

async function writeScore(
    dirHandle: FileSystemDirectoryHandle,
    isLeft: boolean,
    score: number,
): Promise<void> {
    const handle = await dirHandle.getFileHandle(`${isLeft ? 'left' : 'right'}_score.txt`, { create: true });
    const writable = await handle.createWritable();
    writable.write(score.toString());
    writable.close();
}

async function writeGeneral(
    dirHandle: FileSystemDirectoryHandle,
    isLeft: boolean,
    index: number,
    count: number,
): Promise<void> {
    const handle = await dirHandle.getFileHandle(`${isLeft ? 'left' : 'right'}_general_${index + 1}.txt`, { create: true });
    const writable = await handle.createWritable();
    writable.write(count.toString());
    writable.close();
}

async function writeAllGenerals(
    dirHandle: FileSystemDirectoryHandle,
    isLeft: boolean,
    generalCounts: GeneralCounts,
    generalGoals: ReadonlyArray<Square>,
): Promise<void> {
    await Promise.all(generalGoals.map(async (square, index) => {
        const countState = isLeft
            ? generalCounts[square.name]?.leftCounts
            : generalCounts[square.name]?.rightCounts;
        const count = countState == null
            ? 0
            : Object.keys(countState).reduce(
                (acc, game) => acc + countState[game],
                0
            );
        return await writeGeneral(
            dirHandle,
            isLeft,
            index,
            count,
        )
    }));
}

async function writeToFile(
    dirHandle: FileSystemDirectoryHandle,
    leftScore: number,
    rightScore: number,
    generalCounts: GeneralCounts,
    generalGoals: ReadonlyArray<Square>,
): Promise<void> {
    await Promise.all([
        writeScore(dirHandle, true, leftScore),
        writeScore(dirHandle, false, rightScore),
        writeAllGenerals(dirHandle, true, generalCounts, generalGoals),
        writeAllGenerals(dirHandle, false, generalCounts, generalGoals),
    ]);
}