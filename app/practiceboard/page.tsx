"use client";

import { useEffect, useState } from "react";
import { BingosyncColor, TBoard } from "../matches/parseBingosyncData";
import Board from "../Board";
import getSrlV5Board from "./getSrlV5Board";
import { STANDARD } from "../pastas/standard";
import { Container, Card } from "@mantine/core";
import RunningDuration from "../practice/RunningDuration";

export default function PracticeBoard() {
  const [isHidden, setIsHidden] = useState(true);
  const [board, setBoard] = useState<TBoard>(() =>
    Array(25)
      .fill(null)
      .map((_) => ({ name: "", color: "blank" }))
  );
  useEffect(() => setBoard(getSrlV5Board(STANDARD)), []);
  const [startTime, setStartTime] = useState(Date.now());

  return (
    <Container my="md">
      <Card
        style={{ alignItems: "flex-start" }}
        shadow="sm"
        padding="sm"
        radius="md"
        withBorder
      >
        <Board
          board={board}
          onClickSquare={(squareIndex: number) => {
            const newBoard = [...board];
            const newSquare = { ...board[squareIndex] };
            newSquare.color = newSquare.color === "blank" ? "red" : "blank";
            newBoard[squareIndex] = newSquare;
            setBoard(newBoard);
          }}
          isHidden={isHidden}
          setIsHidden={setIsHidden}
        />
        <RunningDuration
          curStartTime={startTime}
          accumulatedDuration={-60000}
        />
      </Card>
    </Container>
  );
}
