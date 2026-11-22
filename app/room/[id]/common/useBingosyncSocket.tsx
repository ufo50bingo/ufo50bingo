import { useState, useEffect, useRef, ReactNode, useCallback } from "react";
import { Modal, Stack, Group, Button, Text } from "@mantine/core";
import { SoundChoices } from "./NotificationsSection";
import { NewFeed, NewFeedItem } from "@/app/fetchFeed";
import persistEvents from "./persistEvents";
import useIsEnded from "./useIsEnded";
import logSocketDisconnect, {
  createSocketStats,
  DisconnectCause,
} from "./logSocketDisconnect";

const PING_MESSAGE = JSON.stringify({ type: "ping" });
const HEARTBEAT_INTERVAL_MS = 30000;
const PING_TIMEOUT_MS = 10000;

type Props = {
  gameId: number;
  initialFeed: NewFeed;
  userId: null | number;
  playAudio: (soundType: keyof SoundChoices) => void;
  token: string | null;
  isPlay: boolean;
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
  isPlay,
}: Props): Response {
  const [feed, setFeed] = useState(initialFeed);
  const [shouldReconnect, setShouldReconnect] = useState(false);
  const [disconnectSummary, setDisconnectSummary] = useState<null | string>(
    null,
  );
  const isEnded = useIsEnded(feed);
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
      } else if (
        newItem.type === "chat" &&
        (!isPlay ||
          newItem.visibleToPlayers == null ||
          (userId != null && newItem.visibleToPlayers.includes(userId)))
      ) {
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
    if (isEnded) {
      return;
    }
    const socket = new WebSocket(
      `wss://ufo50bingo-websocket.frankthompson-cd2.workers.dev/room/${gameId}`,
    );
    authenticatedRef.current = false;

    // prevent showing modal if connection was closed on purpose
    let isCleanedUp = false;
    let isDisconnected = false;
    const stats = createSocketStats();

    const markDisconnected = (cause: DisconnectCause) => {
      if (isCleanedUp) {
        return;
      }
      if (isDisconnected) {
        // e.g. the close that follows a ping timeout
        console.info("[socket] Event after disconnecting:", cause);
        return;
      }
      isDisconnected = true;
      authenticatedRef.current = false;
      setDisconnectSummary(logSocketDisconnect(socket, gameId, cause, stats));
      setShouldReconnect(true);
      try {
        socket.close();
      } catch {}
    };

    const sendPing = () => {
      if (socket.readyState !== WebSocket.OPEN) {
        return;
      }
      stats.pingSentAt = Date.now();
      stats.pingCount++;
      socket.send(PING_MESSAGE);
    };

    const heartbeat = setInterval(() => {
      const now = Date.now();
      if (stats.lastTickAt != null) {
        stats.longestTickGapMs = Math.max(
          stats.longestTickGapMs,
          now - stats.lastTickAt,
        );
      }
      stats.lastTickAt = now;
      if (socket.readyState !== WebSocket.OPEN) {
        return;
      }
      if (stats.pingSentAt == null) {
        sendPing();
      } else if (now - stats.pingSentAt >= PING_TIMEOUT_MS) {
        markDisconnected({
          type: "ping_timeout",
          msSincePing: now - stats.pingSentAt,
        });
      }
    }, HEARTBEAT_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        stats.lastVisibleAt = Date.now();
        sendPing();
      } else {
        stats.lastHiddenAt = Date.now();
      }
    };
    const onFreeze = () => {
      stats.lastFreezeAt = Date.now();
    };
    const onResume = () => {
      stats.lastResumeAt = Date.now();
      sendPing();
    };
    const onOffline = () => markDisconnected({ type: "offline" });
    const onOnline = () => {
      stats.lastOnlineAt = Date.now();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("freeze", onFreeze);
    document.addEventListener("resume", onResume);
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);

    socket.onopen = () => {
      stats.openedAt = Date.now();
      if (token != null) {
        socket.send(JSON.stringify({ type: "authenticate", token }));
      }
      setShouldReconnect(false);
    };

    socket.onerror = () => {
      stats.errorAt = Date.now();
      console.warn("[socket] Error event", { readyState: socket.readyState });
    };

    socket.onclose = (event) =>
      markDisconnected({
        type: "close",
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });

    socket.onmessage = (evt) => {
      // any message receieved satisfies the heartbeat
      stats.pingSentAt = null;
      stats.lastMessageAt = Date.now();
      stats.messageCount++;

      let data;
      try {
        data = JSON.parse(evt.data);
      } catch {
        return;
      }
      if (data.type === "pong") {
        stats.lastPongAt = Date.now();
        return;
      }
      if (data.type === "authenticated") {
        stats.authenticatedAt = Date.now();
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
      document.removeEventListener("freeze", onFreeze);
      document.removeEventListener("resume", onResume);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
      socket.close();
      socketRef.current = null;
      authenticatedRef.current = false;
    };
  }, [onMessage, gameId, token, addItems, isEnded]);

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
          {disconnectSummary != null && (
            <Text size="sm" c="dimmed">
              Reason: {disconnectSummary}
            </Text>
          )}
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
