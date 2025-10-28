"use client";

import Board from "@/app/Board";
import { RawFeed, RawFeedItem, TBoard } from "@/app/matches/parseBingosyncData";
import { Group } from "@mantine/core";
import { useCallback, useRef, useState } from "react";
import changeColor from "@/app/cast/[id]/changeColor";
import Feed from "@/app/cast/[id]/Feed";
import useBingosyncSocket from "@/app/cast/[id]/useBingosyncSocket";
import revealBoard from "./revealBoard";
import PlaySettings from "./PlaySettings";
import useColor from "./useColor";
import useShownDifficulties from "./useShownDifficulties";
import useDings from "./useDings";
import usePlayerName from "./usePlayerName";

export type Props = {
  id: string;
  board: TBoard;
  rawFeed: RawFeed;
  socketKey: string;
  initialSeed: number;
};

export default function Play({
  id,
  board: initialBoard,
  rawFeed: initialRawFeed,
  socketKey,
  initialSeed,
}: Props) {
  const playerName = usePlayerName();
  const [shownDifficulties, setShownDifficulties] = useShownDifficulties();
  const [dings, setDings] = useDings();
  const [color, setColor] = useColor(id);
  const [isHidden, setIsHidden] = useState(true);
  const dingRef = useRef<HTMLAudioElement | null>(null);

  const onMessage = useCallback(
    (newItem: RawFeedItem) => {
      if (dingRef.current != null) {
        console.log(newItem.player.uuid);
        if (
          ((dings.includes("chat") && newItem.type === "chat") ||
            (dings.includes("square") && newItem.type === "goal")) &&
          newItem.player.name !== playerName
        ) {
          dingRef.current.play();
        }
      }
    },
    [dings, playerName]
  );

  const { board, rawFeed, seed, reconnectModal } = useBingosyncSocket({
    id,
    initialBoard,
    initialRawFeed,
    initialSeed,
    socketKey,
    onMessage,
  });

  return (
    <>
      <Group>
        <Board
          board={board}
          onClickSquare={async (squareIndex) => {
            const isClearing = board[squareIndex].color === color;
            try {
              await changeColor(id, squareIndex, color ?? "red", isClearing);
            } catch {}
          }}
          isHidden={isHidden}
          setIsHidden={setIsHidden}
          shownDifficulties={shownDifficulties}
          hiddenText="Click to reveal"
          onReveal={async () => await revealBoard(id)}
        />
        <Feed rawFeed={rawFeed} />
      </Group>
      <PlaySettings
        id={id}
        seed={seed}
        color={color}
        setColor={setColor}
        shownDifficulties={shownDifficulties}
        setShownDifficulties={setShownDifficulties}
        dings={dings}
        setDings={setDings}
      />
      {dings.length > 0 && (
        <audio preload="none" src="/ding.mp3" ref={dingRef} />
      )}
      {reconnectModal}
    </>
  );
}
