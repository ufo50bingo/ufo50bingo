import { useState, useEffect, useRef, ReactNode, useCallback } from "react";
import { Modal, Stack, Group, Button } from "@mantine/core";
import { SoundChoices } from "./NotificationsSection";
import { NewFeed, NewFeedItem } from "@/app/fetchFeed";
import persistEvents from "./persistEvents";

type Props = {
  gameId: number;
  initialFeed: NewFeed;
  userId: null | number;
  playAudio: (soundType: keyof SoundChoices) => void;
  token: string | null;
};

type Response = {
  feed: NewFeed;
  reconnectModal: null | undefined | ReactNode;
  sendEvents:
    | null
    | ((newEvents: ReadonlyArray<NewFeedItem>) => Promise<boolean>);
};

export default function useBingosyncSocket({
  gameId,
  initialFeed,
  userId,
  playAudio,
  token,
}: Props): Response {
  const [feed, setFeed] = useState(initialFeed);
  const [shouldReconnect, setShouldReconnect] = useState(false);
  const socketRef = useRef<null | WebSocket>(null);
  const authenticatedRef = useRef(false);

  const playAudioRef = useRef(playAudio);
  // eslint-disable-next-line react-hooks/refs
  playAudioRef.current = playAudio;

  const onMessage = useCallback(
    (newItem: NewFeedItem) => {
      if (newItem.type === "player_order") {
        return;
      }
      if (newItem.userId === userId) {
        return;
      }
      if (newItem.type === "color_mark") {
        playAudioRef.current("square");
      } else if (newItem.type === "chat") {
        playAudioRef.current("chat");
      } else if (newItem.type === "timer_event" && newItem.event === "pause") {
        playAudioRef.current("pause");
      }
    },
    [userId],
  );

  const addItems = useCallback((newItems: ReadonlyArray<NewFeedItem>) => {
    setFeed((prevFeed: NewFeed) => {
      // TODO: Check for dupes?
      const newFeed = [...prevFeed, ...newItems];
      newFeed.sort((a, b) => a.time - b.time);
      return newFeed;
    });
  }, []);

  const sendEvents = useCallback(
    async (events: ReadonlyArray<NewFeedItem>): Promise<boolean> => {
      const socket = socketRef.current;
      if (
        socket == null ||
        socket.readyState !== WebSocket.OPEN ||
        !authenticatedRef.current ||
        token == null
      ) {
        return false;
      }

      addItems(events);

      for (const event of events) {
        socket.send(
          JSON.stringify({
            type: "event",
            message: JSON.stringify(event),
          }),
        );
      }

      await persistEvents(gameId, token, events);
      return true;
    },
    [addItems, gameId, token],
  );

  useEffect(() => {
    const socket = new WebSocket(
      `wss://ufo50bingo-websocket.frankthompson-cd2.workers.dev/room/${gameId}`,
    );
    authenticatedRef.current = false;

    socket.onopen = () => {
      if (token != null) {
        socket.send(
          JSON.stringify({
            type: "authenticate",
            token,
          }),
        );
      }
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
      const data = JSON.parse(evt.data);
      if (data.type === "authenticated") {
        authenticatedRef.current = true;
        return;
      }
      const rawItem: NewFeedItem = data;
      addItems([rawItem]);
      onMessage(rawItem);
    };

    socketRef.current = socket;

    return () => {
      socket.close();
      socketRef.current = null;
      authenticatedRef.current = false;
    };
  }, [onMessage, gameId, token, addItems]);

  return {
    feed,
    sendEvents: token != null ? sendEvents : null,
    reconnectModal: shouldReconnect && (
      <Modal
        fullScreen={false}
        centered={true}
        onClose={() => setShouldReconnect(false)}
        opened={true}
        title="Reconnection needed"
      >
        <Stack>
          <span>You have been disconnected! Please refresh your page.</span>
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
  };
}
