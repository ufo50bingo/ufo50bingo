"use client";

import { useMemo, useState } from "react";
import { TBoard } from "../matches/parseBingosyncData";
import Board from "../Board";
import { Container, Card, Text, Button, Stack, Title } from "@mantine/core";
import useTimer from "../useTimer";
import { LocalDate, toISODate } from "./localDate";
import useDailyColor from "./useDailyColor";
import ColorSelector from "../room/[id]/common/ColorSelector";

type Props = {
    date: LocalDate;
    board: ReadonlyArray<string>;
};

export default function Daily({ date, board: plainBoard }: Props) {
    const [isHidden, setIsHidden] = useState(true);
    const [color, setColor] = useDailyColor();
    const [completedIndexes, setCompletedIndexes] = useState<Set<number>>(new Set());
    const board = useMemo<TBoard>(() =>
        plainBoard
            .map((name, index) => ({ name, color: completedIndexes.has(index) ? color : "blank" })),
        [plainBoard, completedIndexes, color],
    );

    const { isRunning, pause, start, timer } = useTimer({
        isRunning: false,
        durationMS: -60000,
    });

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
                            onClickSquare={(squareIndex: number) => {
                                const newSet = new Set(completedIndexes);
                                if (newSet.has(squareIndex)) {
                                    newSet.delete(squareIndex);
                                } else {
                                    newSet.add(squareIndex);
                                }
                                setCompletedIndexes(newSet);
                            }}
                            hiddenText={
                                <>
                                    <div>Click to reveal today's board.</div>
                                    <div>Start playing when the timer hits 0:00.0!</div>
                                </>
                            }
                            isHidden={isHidden}
                            setIsHidden={() => {
                                start();
                                setIsHidden(false);
                            }}
                            shownDifficulties={[]}
                        />
                        <Text style={{ alignSelf: "center", fontVariantNumeric: "tabular-nums" }} size="xl">
                            {timer}
                        </Text>
                        <Button
                            onClick={() => (isRunning ? pause() : start())}
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
