"use client";

import Board from "@/app/Board";
import { fetchBoard } from "@/app/fetchMatchInfo";
import {
  BingosyncColor,
  getBoard,
  getChangelog,
  RawFeed,
  RawFeedItem,
  Square,
  TBoard,
} from "@/app/matches/parseBingosyncData";
import { Button, Group, Modal, Stack } from "@mantine/core";
import { useEffect, useMemo, useRef, useState } from "react";
import Feed from "./Feed";
import { Game, GoalName } from "@/app/goals";
import { getAllTerminalCodes, getGameToGoals } from "./findAllGames";
import { GOAL_TO_TYPES } from "./goalToTypes";
import GeneralGoal from "./GeneralGoal";
import InfoCard from "./InfoCard";
import GameInfo from "./GameInfo";
import CastSettings from "./CastSettings";
import GeneralIcons from "./GeneralIcons";
import EditSquare from "./EditSquare";
import { getResult } from "@/app/matches/computeResult";
import useSyncedState, { CountState } from "./useSyncedState";
import useLocalState from "./useLocalState";

export type CastProps = {
  id: string;
  board: TBoard;
  rawFeed: RawFeed;
  socketKey: string;
  initialSeed: number;
  initialCounts: { [goal: string]: CountState };
  initialLeftColor: BingosyncColor;
  initialRightColor: BingosyncColor;
};

export default function Cast({
  id,
  board: initialBoard,
  rawFeed: initialRawFeed,
  socketKey,
  initialSeed,
  initialCounts,
  initialLeftColor,
  initialRightColor,
}: CastProps) {
  const [seed, setSeed] = useState(initialSeed);

  const {
    leftColor,
    setLeftColor,
    rightColor,
    setRightColor,
    generals,
    setGeneralGameCount,
  } = useSyncedState({ id, seed, initialCounts, initialLeftColor, initialRightColor });
  const {
    shownDifficulties,
    showAll,
    setShownDifficulties,
    addShowAll,
  } = useLocalState(id, seed);

  const [board, setBoard] = useState(initialBoard);
  const [rawFeed, setRawFeed] = useState(initialRawFeed);
  const [gameToGoals, setGameToGoals] = useState(() =>
    getGameToGoals(initialBoard)
  );
  const [editingIndex, setEditingIndex] = useState<null | number>(null);
  const [shouldReconnect, setShouldReconnect] = useState(false);
  const socketRef = useRef<null | WebSocket>(null);

  const leftScore = board.filter((square) => square.color === leftColor).length;
  const rightScore = board.filter(
    (square) => square.color === rightColor
  ).length;

  const tiebreakWinner = useMemo<BingosyncColor | null>(() => {
    try {
      if (
        leftScore !== rightScore ||
        leftColor === rightColor ||
        leftScore === 0
      ) {
        return null;
      }
      const changelog = getChangelog(rawFeed);
      const result = getResult(board, changelog, null, null);
      if (result == null) {
        return null;
      }
      const isValid =
        result.winnerScore === leftScore &&
        result.opponentScore === leftScore &&
        (result.winnerColor === leftColor ||
          result.winnerColor === rightColor) &&
        (result.opponentColor === leftColor ||
          result.opponentColor === rightColor);
      if (!isValid) {
        return null;
      }
      return result.winnerColor as BingosyncColor;
    } catch {
      return null;
    }
  }, [leftScore, rightScore, leftColor, rightColor, rawFeed, board]);

  const generalGoals = useMemo<ReadonlyArray<Square>>(() => {
    const filtered = board.filter((square) => {
      const types = GOAL_TO_TYPES[square.name];
      return types != null && types[1] === "general";
    });
    let spliceIndex = filtered.findIndex((square) =>
      isGift(square.name as GoalName)
    );
    if (spliceIndex < 0) {
      spliceIndex = filtered.findIndex((square) =>
        isGoldCherry(square.name as GoalName)
      );
    }
    if (spliceIndex < 0) {
      return filtered;
    }
    const [toMove] = filtered.splice(spliceIndex, 1);
    filtered.unshift(toMove);
    return filtered;
  }, [board]);
  const [terminalCodes, setTerminalCodes] = useState(() =>
    getAllTerminalCodes(initialBoard)
  );

  useEffect(() => {
    const socket = new WebSocket("wss://sockets.bingosync.com/broadcast");

    socket.onopen = () => {
      socket.send(JSON.stringify({ socket_key: socketKey }));
      setShouldReconnect(false);
    };

    socket.onclose = () => {
      console.log("*** Disconnected from server, try refreshing. ***");
      setTimeout(() => {
        if (
          socketRef.current == null ||
          socketRef.current.readyState !== socketRef.current.OPEN
        ) {
          setShouldReconnect(true);
        }
      }, 1000);
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
        setSeed(rawItem.seed);
        const rawBoard = await fetchBoard(id);
        const newBoard = getBoard(rawBoard);
        setGameToGoals(getGameToGoals(newBoard));
        setTerminalCodes(getAllTerminalCodes(newBoard));
        setBoard(newBoard);
      }
    };

    socketRef.current = socket;

    return () => {
      socket.close();
      socketRef.current = null;
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

  const getCard = (g: Square, h: null | undefined | number) => (
    <GeneralGoal
      key={g.name}
      gameToGoals={gameToGoals}
      name={g.name as GoalName}
      isFinished={g.color !== "blank"}
      terminalCodes={terminalCodes}
      countState={generals[g.name]}
      showAll={showAll.includes(g.name as GoalName)}
      setGeneralGameCount={setGeneralGameCount}
      addShowAll={addShowAll}
      leftColor={leftColor}
      rightColor={rightColor}
      height={h}
    />
  );

  return (
    <>
      <Group>
        <Group gap={0}>
          <GeneralIcons
            isLeft={true}
            color={leftColor}
            score={leftScore}
            generalGoals={generalGoals}
            generalState={generals}
            hasTiebreaker={tiebreakWinner === leftColor}
          />
          <Board
            board={board}
            onClickSquare={setEditingIndex}
            isHidden={false}
            setIsHidden={() => false}
            shownDifficulties={shownDifficulties}
          />
          <GeneralIcons
            isLeft={false}
            color={rightColor}
            score={rightScore}
            generalGoals={generalGoals}
            generalState={generals}
            hasTiebreaker={tiebreakWinner === rightColor}
          />
        </Group>
        <Feed rawFeed={rawFeed} />
        {getCard(generalGoals[0], 475)}
        <Group w="100%">
          {generalGoals.slice(1).map((g) => getCard(g, null))}
          <InfoCard title="Multi-goal games" height={null} width={205}>
            <Stack gap={4}>
              {multiGoalGames.length > 0
                ? multiGoalGames
                : "No multi-goal games on this card!"}
            </Stack>
          </InfoCard>
        </Group>
      </Group>
      <CastSettings
        id={id}
        seed={seed}
        leftColor={leftColor}
        setLeftColor={setLeftColor}
        rightColor={rightColor}
        setRightColor={setRightColor}
        shownDifficulties={shownDifficulties}
        setShownDifficulties={setShownDifficulties}
      />
      {editingIndex != null && (
        <EditSquare
          id={id}
          board={board}
          editingIndex={editingIndex}
          setEditingIndex={setEditingIndex}
        />
      )}
      {shouldReconnect && (
        <Modal
          fullScreen={false}
          centered={true}
          onClose={() => setShouldReconnect(false)}
          opened={true}
          title="Reconnection needed"
        >
          <Stack>
            <span>
              You have been disconnected from Bingosync! Please refresh your
              page.
            </span>
            <Group justify="end">
              <Button onClick={() => setShouldReconnect(false)}>Ignore</Button>
              <Button
                color="green"
                onClick={() => {
                  window.location.reload();
                }}
              >
                Refresh
              </Button>
            </Group>
          </Stack>
        </Modal>
      )}
    </>
  );
}

function isGift(goal: GoalName): boolean {
  switch (goal) {
    case "Collect 6 gifts from games on this card":
    case "Collect 7 gifts from games on this card":
    case "Collect 8 gifts from games on this card":
      return true;
    default:
      return false;
  }
}

function isGoldCherry(goal: GoalName): boolean {
  switch (goal) {
    case "Collect 2 cherry disks from games on this card":
    case "Collect 3 cherry disks from games on this card":
    case "Collect 3 gold disks from games on this card":
    case "Collect 4 gold disks from games on this card":
      return true;
    default:
      return false;
  }
}
