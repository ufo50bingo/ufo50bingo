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
import { REQUEST_PAUSE_CHAT } from "./REQUEST_PAUSE_CHAT";
import useWakeLock from "./useWakeLock";

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
  const [pauseRequestName, setPauseRequestName] = useState<string | null>(null);

  const dingRef = useRef<HTMLAudioElement | null>(null);
  const alarmRef = useRef<HTMLAudioElement | null>(null);

  useWakeLock();

  const onMessage = useCallback(
    (newItem: RawFeedItem) => {
      if (newItem.player.name === playerName) {
        return;
      }
      if (newItem.type === "chat") {
        if (newItem.text === REQUEST_PAUSE_CHAT) {
          setPauseRequestName(newItem.player.name);
          if (dings.includes("pause") && alarmRef.current != null) {
            alarmRef.current.play();
          } else if (dings.includes("chat") && dingRef.current != null) {
            dingRef.current.play();
          }
        } else {
          if (dings.includes("chat") && dingRef.current != null) {
            dingRef.current.play();
          }
        }
      } else if (newItem.type === "goal") {
        if (dings.includes("square") && dingRef.current != null) {
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
          pauseRequestName={pauseRequestName}
          clearPauseRequest={() => setPauseRequestName(null)}
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
        <>
          <audio preload="none" src="/ding.mp3" ref={dingRef} />
          <audio preload="none" src="/alarm.mp3" ref={alarmRef} />
        </>
      )}
      {reconnectModal}
    </>
  );
}
