"use client";

import Board from "@/app/Board";
import { RawFeed, RawFeedItem, TBoard } from "@/app/matches/parseBingosyncData";
import { Stack } from "@mantine/core";
import { useEffect, useState } from "react";

type Props = {
  board: TBoard;
  rawFeed: RawFeed;
  socketKey: string;
};

export default function Cast({
  board: initialBoard,
  rawFeed: initialRawFeed,
  socketKey,
}: Props) {
  const [board, setBoard] = useState(initialBoard);
  const [rawFeed, setRawFeed] = useState(initialRawFeed);

  useEffect(() => {
    const socket = new WebSocket("wss://sockets.bingosync.com/broadcast");

    socket.onopen = () =>
      socket.send(JSON.stringify({ socket_key: socketKey }));

    socket.onclose = () => {
      console.log("*** Disconnected from server, try refreshing. ***");
    };

    socket.onmessage = (evt) => {
      const rawItem: RawFeedItem = JSON.parse(evt.data);
      setRawFeed((prevRawFeed) => ({
        events: [...prevRawFeed.events, rawItem],
        allIncluded: true,
      }));

      if (rawItem.type === "goal") {
        setBoard((prevBoard) => {
          const newBoard = [...prevBoard];
          const slot = rawItem.square.slot;
          const color = rawItem.square.colors;
          const slotIndex = Number(slot.slice(4)) - 1;

          const square = { ...prevBoard[slotIndex], color };
          newBoard[slotIndex] = square;
          return newBoard;
        });
      }
    };

    return () => {
      socket.close();
    };
  }, [socketKey]);

  return (
    <Stack>
      <Board
        board={board}
        onClickSquare={null}
        isHidden={false}
        setIsHidden={() => false}
        showDifficulty={true}
      />
      {rawFeed.events.map((event, index) => (
        <div key={index}>{JSON.stringify(event)}</div>
      ))}
    </Stack>
  );
}
