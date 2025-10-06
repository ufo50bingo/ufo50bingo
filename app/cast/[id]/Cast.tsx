"use client";

import Board from "@/app/Board";
import { fetchBoard } from "@/app/fetchMatchInfo";
import {
  getBoard,
  RawFeed,
  RawFeedItem,
  Square,
  TBoard,
} from "@/app/matches/parseBingosyncData";
import { Group, Stack } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import Feed from "./Feed";
import { Difficulty, Game, GoalName } from "@/app/goals";
import { getAllTerminalCodes, getGameToGoals } from "./findAllGames";
import { GOAL_TO_TYPES } from "./goalToTypes";
import GeneralGoal from "./GeneralGoal";
import InfoCard from "./InfoCard";
import GameInfo from "./GameInfo";
import CastSettings from "./CastSettings";

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
  const [shownDifficulties, setShownDifficulties] = useState<
    ReadonlyArray<Difficulty>
  >(["veryhard", "general"]);
  const [gameToGoals, setGameToGoals] = useState(() =>
    getGameToGoals(initialBoard)
  );
  const generalGoals = useMemo<ReadonlyArray<Square>>(
    () => board.filter((square) => GOAL_TO_TYPES[square.name][1] === "general"),
    [board]
  );
  const [terminalCodes, setTerminalCodes] = useState(() =>
    getAllTerminalCodes(initialBoard)
  );

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
        const newBoard = getBoard(rawBoard);
        setGameToGoals(getGameToGoals(newBoard));
        setTerminalCodes(getAllTerminalCodes(newBoard));
        setBoard(newBoard);
      }
    };

    return () => {
      socket.close();
    };
  }, [socketKey, id]);

  const multiGoalGames = Object.keys(gameToGoals)
    .filter((game) => gameToGoals[game].length > 1)
    .map((game) => (
      <GameInfo
        key={game}
        game={game as Game}
        goals={gameToGoals[game]}
        description={null}
      />
    ));

  return (
    <>
      <Group>
        <Board
          board={board}
          onClickSquare={null}
          isHidden={false}
          setIsHidden={() => false}
          shownDifficulties={shownDifficulties}
        />
        <Feed rawFeed={rawFeed} />
        <Group>
          {generalGoals.map((g) => (
            <GeneralGoal
              key={g.name}
              gameToGoals={gameToGoals}
              name={g.name as GoalName}
              isChecked={g.color !== "blank"}
              terminalCodes={terminalCodes}
            />
          ))}
          <InfoCard title="Multi-goal games">
            <Stack gap={4}>
              {multiGoalGames.length > 0
                ? multiGoalGames
                : "No multi-goal games on this card!"}
            </Stack>
          </InfoCard>
        </Group>
      </Group>
      <CastSettings
        shownDifficulties={shownDifficulties}
        setShownDifficulties={setShownDifficulties}
      />
    </>
  );
}
