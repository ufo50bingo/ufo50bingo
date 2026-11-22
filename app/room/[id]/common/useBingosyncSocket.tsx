import { useState, useEffect, useRef, ReactNode, useCallback } from "react";
import { Modal, Stack, Group, Button } from "@mantine/core";
import { SoundChoices } from "./NotificationsSection";
import { NewFeed, NewFeedItem } from "../play/PlayPage";

type Props = {
  gameId: number;
  initialFeed: NewFeed;
  userId: number;
  playAudio: (soundType: keyof SoundChoices) => void;
};

type Response = {
  feed: NewFeed;
  reconnectModal: null | undefined | ReactNode;
};

export default function useBingosyncSocket({
  gameId,
  initialFeed,
  userId,
  playAudio,
}: Props): Response {
  const [feed, setFeed] = useState(initialFeed);
  const [shouldReconnect, setShouldReconnect] = useState(false);
  const socketRef = useRef<null | WebSocket>(null);

  const playAudioRef = useRef(playAudio);
  // eslint-disable-next-line react-hooks/refs
  playAudioRef.current = playAudio;

  const onMessage = useCallback(
    (newItem: NewFeedItem) => {
      if (newItem.user.id === userId) {
        return;
      }
      if (newItem.type === "color_mark") {
        playAudioRef.current("square");
      }
      // else if (newItem.type === "chat") {
      //   playAudioRef.current("chat");
      // }
    },
    [userId],
  );

  useEffect(() => {
    const socket = new WebSocket(
      `wss://ufo50bingo-websocket.frankthompson-cd2.workers.dev/room/${gameId}`,
    );

    socket.onopen = () => {
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
      const rawItem: NewFeedItem = JSON.parse(evt.data);
      setFeed((prevFeed) => {
        const newFeed = [...prevFeed];
        newFeed.push(rawItem);
        newFeed.sort((a, b) => a.time - b.time);
        return newFeed;
      });
      onMessage(rawItem);
    };

    socketRef.current = socket;

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [onMessage, gameId]);

  return {
    feed,
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
  };
}
