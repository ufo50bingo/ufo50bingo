"use client";

import Board from "@/app/Board";
import {
  BingosyncColor,
  getChangelog,
  RawFeed,
  RawFeedItem,
  TBoard,
} from "@/app/matches/parseBingosyncData";
import { Group, Stack } from "@mantine/core";
import { useCallback, useMemo, useRef, useState } from "react";
import revealBoard from "./revealBoard";
import PlaySettings from "./PlaySettings";
import useColor from "./useColor";
import useShownDifficulties from "./useShownDifficulties";
import useDings from "./useDings";
import { REQUEST_PAUSE_CHAT } from "../common/REQUEST_PAUSE_CHAT";
import useWakeLock from "./useWakeLock";
import changeColor from "../cast/changeColor";
import Feed from "../common/Feed";
import useBingosyncSocket from "../common/useBingosyncSocket";
import { getResult } from "@/app/matches/computeResult";
import ScoreSquare from "../common/ScoreSquare";

export type Props = {
  id: string;
  board: TBoard;
  rawFeed: RawFeed;
  socketKey: string;
  initialSeed: number;
  playerName: string;
};

export default function Play({
  id,
  board: initialBoard,
  rawFeed: initialRawFeed,
  socketKey,
  initialSeed,
  playerName,
}: Props) {
  const [shownDifficulties, setShownDifficulties] = useShownDifficulties();
  const [dings, setDings] = useDings();
  const [color, setColor] = useColor(id);
  const [isHidden, setIsHidden] = useState(true);
  const [pauseRequestName, setPauseRequestName] = useState<string | null>(null);

  const dingRef = useRef<HTMLAudioElement | null>(null);
  const alarmRef = useRef<HTMLAudioElement | null>(null);

  const selectedColor = color ?? "red";

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

  const [myScore, opponent] = useMemo(() => {
    const scores: { [color: string]: number } = {};
    board.forEach((square) => {
      const color = square.color;
      if (color === "blank") {
        return;
      }
      const score = scores[color] ?? 0;
      scores[color] = score + 1;
    });
    const myScore = scores[selectedColor] ?? 0;
    const entries = Object.entries(scores);
    entries.sort((a, b) => a[1] - b[1]);
    const bestOpponent = entries.find((e) => e[0] !== selectedColor);
    const bestOpponentEntry =
      bestOpponent == null
        ? null
        : { color: bestOpponent[0] as BingosyncColor, score: bestOpponent[1] };
    return [myScore, bestOpponentEntry];
  }, [board, selectedColor]);

  const tiebreakWinner = useMemo<BingosyncColor | null>(() => {
    try {
      if (
        opponent == null ||
        myScore !== opponent.score ||
        selectedColor === opponent.color
      ) {
        return null;
      }
      const changelog = getChangelog(rawFeed);
      const result = getResult(board, changelog, null, null);
      if (result == null) {
        return null;
      }
      const isValid =
        result.winnerScore === myScore &&
        result.opponentScore === myScore &&
        (result.winnerColor === selectedColor ||
          result.winnerColor === opponent.color) &&
        (result.opponentColor === selectedColor ||
          result.opponentColor === opponent.color);
      if (!isValid) {
        return null;
      }
      return result.winnerColor as BingosyncColor;
    } catch {
      return null;
    }
  }, [opponent, myScore, selectedColor, rawFeed, board]);

  return (
    <>
      <Group>
        <Stack gap={8}>
          <Board
            board={board}
            onClickSquare={async (squareIndex) => {
              const isClearing = board[squareIndex].color === selectedColor;
              try {
                await changeColor(id, squareIndex, selectedColor, isClearing);
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
          <Group justify="space-between">
            <div style={{ display: "flex" }}>
              <div
                style={{ width: "62px", height: "62px", marginRight: "8px" }}
              >
                <ScoreSquare
                  score={myScore}
                  color={selectedColor}
                  hasTiebreaker={tiebreakWinner === selectedColor}
                />
              </div>
              <div style={{ width: "62px", height: "62px" }}>
                <ScoreSquare
                  score={opponent?.score ?? 0}
                  color={opponent?.color ?? "blank"}
                  hasTiebreaker={tiebreakWinner === opponent?.color}
                />
              </div>
            </div>
            <div>Time</div>
            <div>Seed</div>
          </Group>
        </Stack>
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
