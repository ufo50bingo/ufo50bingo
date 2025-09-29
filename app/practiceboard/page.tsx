"use client";

import { useEffect, useState } from "react";
import { TBoard } from "../matches/parseBingosyncData";
import Board from "../Board";
import getSrlV5Board from "./getSrlV5Board";
import { STANDARD } from "../pastas/standard";
import { Container, Card, Text, Button, Stack } from "@mantine/core";
import useTimer from "../useTimer";

export default function PracticeBoard() {
  const [isHidden, setIsHidden] = useState(true);
  const [board, setBoard] = useState<TBoard>(() =>
    Array(25)
      .fill(null)
      .map((_) => ({ name: "", color: "blank" }))
  );
  useEffect(() => setBoard(getSrlV5Board(STANDARD)), []);

  const { isRunning, pause, start, timer } = useTimer({
    isRunning: false,
    durationMS: -60000,
  });

  return (
    <Container>
      <Card shadow="sm" padding="sm" radius="md" withBorder>
        <Stack gap={4} style={{ alignSelf: "center" }}>
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
