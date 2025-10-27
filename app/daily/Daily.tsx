"use client";

import { useState } from "react";
import { TBoard } from "../matches/parseBingosyncData";
import Board from "../Board";
import { Container, Card, Text, Button, Stack, Title } from "@mantine/core";
import useTimer from "../useTimer";
import { LocalDate, toISODate } from "./localDate";

type Props = {
    date: LocalDate;
    board: ReadonlyArray<string>;
};

export default function Daily({ date, board: plainBoard }: Props) {
    const [isHidden, setIsHidden] = useState(true);
    const [board, setBoard] = useState<TBoard>(() =>
        plainBoard
            .map(name => ({ name, color: "blank" }))
    );

    const { isRunning, pause, start, timer } = useTimer({
        isRunning: false,
        durationMS: -60000,
    });

    return (
        <Container>
            <Card shadow="sm" padding="sm" radius="md" withBorder>
                <Stack gap={4} style={{ alignSelf: "center" }}>
                    <Title order={1}>Daily Bingo — ({toISODate(date)})</Title>
                    <Board
                        board={board}
                        onClickSquare={(squareIndex: number) => {
                            const newBoard = [...board];
                            const newSquare = { ...board[squareIndex] };
                            newSquare.color = newSquare.color === "blank" ? "red" : "blank";
                            newBoard[squareIndex] = newSquare;
                            setBoard(newBoard);
                        }}
                        hiddenText={
                            <>
                                <div>Click to Reveal</div>
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
                    <Text style={{ alignSelf: "center" }} size="xl">
                        {timer}
                    </Text>
                    <Button
                        onClick={() => (isRunning ? pause() : start())}
                        fullWidth={true}
                    >
                        {isRunning ? "Pause" : "Resume"}
                    </Button>
                </Stack>
            </Card>
        </Container>
    );
}
