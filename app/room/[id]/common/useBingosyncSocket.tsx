import { useState, useEffect, useRef, ReactNode, useCallback } from "react";
import { Modal, Stack, Group, Button } from "@mantine/core";
import { SoundChoices } from "./NotificationsSection";
import { NewFeed, NewFeedItem } from "@/app/fetchFeed";
import persistEvents from "./persistEvents";

const PING_MESSAGE = JSON.stringify({ type: "ping" });
const HEARTBEAT_INTERVAL_MS = 10000;

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
    null | ((newEvents: ReadonlyArray<NewFeedItem>) => Promise<boolean>);
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

    // prevent showing modal if connection was closed on purpose
    let isCleanedUp = false;
    let isDisconnected = false;
    let awaitingReply = false;

    const markDisconnected = () => {
      if (isCleanedUp || isDisconnected) {
        return;
      }
      isDisconnected = true;
      authenticatedRef.current = false;
      setShouldReconnect(true);
      try {
        socket.close();
      } catch {}
    };

    const sendPing = () => {
      if (socket.readyState !== WebSocket.OPEN) {
        return;
      }
      awaitingReply = true;
      socket.send(PING_MESSAGE);
    };

    const heartbeat = setInterval(() => {
      if (socket.readyState !== WebSocket.OPEN) {
        return;
      }
      if (awaitingReply) {
        // we didn't get a response from the last ping, so assume disconnection
        markDisconnected();
        return;
      }
      sendPing();
    }, HEARTBEAT_INTERVAL_MS);

    // after sleep or a long time in the background, the socket may be dead.
    // ping right away
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        awaitingReply = false;
        sendPing();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("offline", markDisconnected);

    socket.onopen = () => {
      if (token != null) {
        socket.send(JSON.stringify({ type: "authenticate", token }));
      }
      setShouldReconnect(false);
    };

    socket.onclose = markDisconnected;

    socket.onmessage = (evt) => {
      // any message receieved satisfies the heartbeat
      awaitingReply = false;

      let data;
      try {
        data = JSON.parse(evt.data);
      } catch {
        return;
      }
      if (data.type === "pong") {
        return;
      }
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
      isCleanedUp = true;
      clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("offline", markDisconnected);
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
