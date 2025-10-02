"use client";

import Board from "@/app/Board";
import { fetchBoard } from "@/app/fetchMatchInfo";
import {
  getBoard,
  RawFeed,
  RawFeedItem,
  TBoard,
} from "@/app/matches/parseBingosyncData";
import { Group } from "@mantine/core";
import { useEffect, useState } from "react";
import Feed from "./Feed";

type Props = {
  id: string;
  board: TBoard;
  rawFeed: RawFeed;
  socketKey: string;
};

export default function Cast({
  id,
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

    socket.onmessage = async (evt) => {
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
      } else if (rawItem.type === "new-card") {
        const rawBoard = await fetchBoard(id);
        setBoard(getBoard(rawBoard));
      }
    };

    return () => {
      socket.close();
    };
  }, [socketKey, id]);

  return (
    <Group>
      <Board
        board={board}
        onClickSquare={null}
        isHidden={false}
        setIsHidden={() => false}
        showDifficulty={true}
      />
      <Feed rawFeed={rawFeed} />
    </Group>
  );
}
