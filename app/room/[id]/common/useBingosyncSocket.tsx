import { fetchBoard } from "@/app/fetchMatchInfo";
import {
  getBoard,
  RawFeed,
  RawFeedItem,
  TBoard,
} from "@/app/matches/parseBingosyncData";
import {
  useState,
  useEffect,
  useRef,
  ReactNode,
  useCallback,
  RefObject,
} from "react";
import { Modal, Stack, Group, Button } from "@mantine/core";
import { REQUEST_PAUSE_CHAT } from "./REQUEST_PAUSE_CHAT";
import { Ding } from "../play/useDings";

type Props = {
  id: string;
  initialBoard: TBoard;
  initialRawFeed: RawFeed;
  socketKey: string;
  initialSeed: number;
  onNewCard?: (newBoard: TBoard) => unknown;
  dings: ReadonlyArray<Ding>;
  playerName: string;
  setPauseRequestName: (newName: string) => unknown;
  pauseRef?: RefObject<(() => unknown) | null>;
};

type Response = {
  board: TBoard;
  rawFeed: RawFeed;
  seed: number;
  reconnectModal: null | undefined | ReactNode;
  dingAudio: null | undefined | ReactNode;
};

export default function useBingosyncSocket({
  id,
  initialBoard,
  initialRawFeed,
  initialSeed,
  socketKey,
  onNewCard,
  dings,
  playerName,
  setPauseRequestName,
  pauseRef,
}: Props): Response {
  const [seed, setSeed] = useState(initialSeed);
  const [board, setBoard] = useState(initialBoard);
  const [rawFeed, setRawFeed] = useState(initialRawFeed);
  const [shouldReconnect, setShouldReconnect] = useState(false);
  const socketRef = useRef<null | WebSocket>(null);

  const dingRef = useRef<HTMLAudioElement | null>(null);
  const alarmRef = useRef<HTMLAudioElement | null>(null);
  const selectedDingsRef = useRef<ReadonlyArray<Ding>>(dings);
  // eslint-disable-next-line react-hooks/refs
  selectedDingsRef.current = dings;

  const onMessage = useCallback(
    (newItem: RawFeedItem) => {
      const isPause =
        newItem.type === "chat" && newItem.text === REQUEST_PAUSE_CHAT;
      if (isPause) {
        if (pauseRef?.current != null) {
          pauseRef.current();
        }
        setPauseRequestName(newItem.player.name);
      }
      if (newItem.player.name === playerName) {
        return;
      }
      if (newItem.type === "chat") {
        if (
          isPause &&
          selectedDingsRef.current.includes("pause") &&
          alarmRef.current != null
        ) {
          alarmRef.current.play();
        } else if (
          selectedDingsRef.current.includes("chat") &&
          dingRef.current != null
        ) {
          dingRef.current.play();
        } else {
          if (
            selectedDingsRef.current.includes("chat") &&
            dingRef.current != null
          ) {
            dingRef.current.play();
          }
        }
      } else if (newItem.type === "goal") {
        if (
          selectedDingsRef.current.includes("square") &&
          dingRef.current != null
        ) {
          dingRef.current.play();
        }
      }
    },
    [playerName, pauseRef, setPauseRequestName]
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
        if (onNewCard != null) {
          onNewCard(newBoard);
        }
        setBoard(newBoard);
      }

      onMessage(rawItem);
    };

    socketRef.current = socket;

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [socketKey, id, onNewCard, onMessage]);

  return {
    board,
    rawFeed,
    seed,
    reconnectModal: shouldReconnect && (
      <Modal
        fullScreen={false}
        centered={true}
        onClose={() => setShouldReconnect(false)}
        opened={true}
        title="Reconnection needed"
      >
        <Stack>
          <span>
            You have been disconnected from Bingosync! Please refresh your page.
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
    ),
    dingAudio: dings.length > 0 && (
      <>
        <audio preload="none" src="/ding.mp3" ref={dingRef} />
        <audio preload="none" src="/alarm.mp3" ref={alarmRef} />
      </>
    ),
  };
}
