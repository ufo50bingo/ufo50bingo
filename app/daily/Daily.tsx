"use client";

import { useMemo, useState } from "react";
import { TBoard } from "../matches/parseBingosyncData";
import Board from "../Board";
import { Container, Card, Text, Button, Stack, Title } from "@mantine/core";
import { LocalDate, toISODate } from "./localDate";
import useDailyColor from "./useDailyColor";
import ColorSelector from "../room/[id]/common/ColorSelector";
import { db } from "../db";
import { useLiveQuery } from "dexie-react-hooks";
import useAttemptNumber from "./useAttemptNumber";
import useFeedTimer from "./useFeedTimer";

type Props = {
    date: LocalDate;
    board: ReadonlyArray<string>;
};

export default function Daily({ date, board: plainBoard }: Props) {
    const isoDate = toISODate(date);
    const [color, setColor] = useDailyColor();
    const [attempt, setAttempt] = useAttemptNumber(isoDate);

    const feed = useLiveQuery(() =>
        db.dailyFeed
            .where({ date: isoDate, attempt })
            .sortBy("time")
    ) ?? [];

    const completedIndexes = useMemo(() => {
        const newSet = new Set();
        feed.forEach(item => {
            if (item.type === "mark") {
                newSet.add(item.squareIndex ?? 25);
            } else if (item.type === "clear") {
                newSet.delete(item.squareIndex ?? 25);
            }
        });
        return newSet;
    }, [feed]);

    const isRevealed = useMemo(() =>
        feed.every(item => item.type !== "reveal"),
        [feed],
    );

    const board = useMemo<TBoard>(() =>
        plainBoard
            .map((name, index) => ({ name, color: completedIndexes.has(index) ? color : "blank" })),
        [plainBoard, completedIndexes, color],
    );

    const { isRunning, pause, unpause, timer } = useFeedTimer(
        feed,
        isoDate,
        attempt,
    );

    return (
        <Container my="md">
            <Card shadow="sm" padding="sm" radius="md" withBorder>
                <Card.Section withBorder={true} inheritPadding={true} py="xs">
                    <Stack>
                        <Title order={1}>Daily Bingo — {date.month}/{date.day}</Title>
                        <Text>
                            Your goal is to claim a bingo as fast as possible.<br />
                            After you've claimed a bingo, you can optionally continue to claim 13 squares,
                            and then continue to a blackout!
                        </Text>
                        <ColorSelector label="Select your preferred color" color={color} setColor={setColor} />
                    </Stack>
                </Card.Section>
                <Card.Section withBorder={true} inheritPadding={true} py="xs">
                    <Stack gap={4} style={{ alignSelf: "center" }}>
                        <Board
                            board={board}
                            onClickSquare={async (squareIndex: number) => {
                                if (completedIndexes.has(squareIndex)) {
                                    await db.dailyFeed.add({ type: "clear", time: Date.now(), squareIndex, date: isoDate, attempt });
                                } else {
                                    await db.dailyFeed.add({ type: "mark", time: Date.now(), squareIndex, date: isoDate, attempt });
                                }
                            }}
                            hiddenText={
                                <>
                                    <div>Click to reveal today's board.</div>
                                    <div>Start playing when the timer hits 0:00.0!</div>
                                </>
                            }
                            isHidden={!isRevealed}
                            setIsHidden={async () => {
                                await db.dailyFeed.add({ type: "reveal", time: Date.now(), date: isoDate, attempt, squareIndex: null });
                            }}
                            shownDifficulties={[]}
                        />
                        <Text style={{ alignSelf: "center", fontVariantNumeric: "tabular-nums" }} size="xl">
                            {timer}
                        </Text>
                        <Button
                            onClick={() => (isRunning ? pause() : unpause())}
                            fullWidth={true}
                        >
                            {isRunning ? "Pause" : "Resume"}
                        </Button>
                    </Stack>
                </Card.Section>
            </Card>
        </Container>
    );
}
