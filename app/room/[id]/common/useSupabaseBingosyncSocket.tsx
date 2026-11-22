import { useState, useEffect, useRef, ReactNode, useCallback } from "react";
import { Modal, Stack, Group, Button, Text } from "@mantine/core";
import { REALTIME_SUBSCRIBE_STATES } from "@supabase/supabase-js";
import { SoundChoices } from "./NotificationsSection";
import { NewFeed, NewFeedItem } from "@/app/fetchFeed";
import persistEvents from "./persistEvents";
import useIsEnded from "./useIsEnded";
import getSupabaseClient, {
  FEED_EVENT,
  FeedBroadcastPayload,
  getFeedTopic,
} from "./getSupabaseClient";

const CONNECT_TIMEOUT_MS = 10000;

type ConnectionWarning = {
  hasConnected: boolean;
  reason: string;
};

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

export default function useSupabaseBingosyncSocket({
  gameId,
  initialFeed,
  userId,
  playAudio,
  token,
  isPlay,
}: Props): Response {
  const supabase = getSupabaseClient();
  const [feed, setFeed] = useState(initialFeed);
  const isEnded = useIsEnded(feed);
  // used to ensure that broadcasts from this tab are ignored
  const [senderId] = useState(() => crypto.randomUUID());
  const [warning, setWarning] = useState<null | ConnectionWarning>(null);

  const playAudioRef = useRef(playAudio);
  // eslint-disable-next-line react-hooks/refs
  playAudioRef.current = playAudio;

  const addItems = useCallback((newItems: ReadonlyArray<NewFeedItem>) => {
    setFeed((prevFeed: NewFeed) => {
      const newFeed = [...prevFeed, ...newItems];
      newFeed.sort((a, b) => a.time - b.time);
      return newFeed;
    });
  }, []);

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
    [userId, isPlay],
  );

  useEffect(() => {
    if (isEnded) {
      return;
    }
    // removing the channel on cleanup reports CLOSED, which isn't a failure
    let isCleanedUp = false;
    let hasConnected = false;
    let isDisconnected = false;

    const onFailure = (reason: string) => {
      if (isCleanedUp || isDisconnected) {
        return;
      }
      isDisconnected = true;
      setWarning({ hasConnected, reason });
    };

    const connectTimer = setTimeout(() => {
      if (!hasConnected) {
        onFailure(`Not connected after ${CONNECT_TIMEOUT_MS / 1000}s`);
      }
    }, CONNECT_TIMEOUT_MS);

    const newChannel = supabase.channel(getFeedTopic(gameId), {
      config: { private: true },
    });

    newChannel
      .on(
        "broadcast",
        { event: FEED_EVENT },
        (message: { payload: FeedBroadcastPayload }) => {
          const { senderId: itemsSenderId, items } = message.payload;
          if (itemsSenderId === senderId) {
            return;
          }
          addItems(items);
          items.forEach(onMessage);
        },
      )
      .subscribe((status, error) => {
        console.info("[supabase]", new Date().toISOString(), status, error);
        if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
          hasConnected = true;
          isDisconnected = false;
          clearTimeout(connectTimer);
          return;
        }
        onFailure(
          error?.message != null && error.message !== ""
            ? `${status}: ${error.message}`
            : status,
        );
      });

    return () => {
      isCleanedUp = true;
      clearTimeout(connectTimer);
      supabase.removeChannel(newChannel);
    };
  }, [gameId, supabase, addItems, onMessage, senderId, isEnded]);

  const sendEvents = useCallback(
    async (events: ReadonlyArray<NewFeedItem>): Promise<boolean> => {
      if (token == null) {
        return false;
      }
      addItems(events);
      await persistEvents(gameId, token, events, senderId);
      return true;
    },
    [addItems, gameId, token, senderId],
  );

  return {
    feed,
    sendEvents: token != null ? sendEvents : null,
    reconnectModal: warning != null && (
      <Modal
        fullScreen={false}
        centered={true}
        onClose={() => setWarning(null)}
        opened={true}
        title={warning.hasConnected ? "Connection lost" : "Could not connect"}
      >
        <Stack>
          <span>
            {warning.hasConnected
              ? "You lost connection to live updates, so you may have missed changes from other people."
              : "Could not connect to live updates, so you won't see changes from other people."}{" "}
            Please refresh your page.
          </span>
          <Text size="sm" c="dimmed">
            Reason: {warning.reason}
          </Text>
          <Group justify="end">
            <Button onClick={() => setWarning(null)}>Ignore</Button>
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
