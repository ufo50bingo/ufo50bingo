import { useState, useEffect, useRef, ReactNode, useCallback } from "react";
import { SoundChoices } from "./NotificationsSection";
import { NewFeed, NewFeedItem } from "@/app/fetchFeed";
import persistEvents from "./persistEvents";
import useIsEnded from "./useIsEnded";
import getSupabaseClient, {
  FEED_EVENT,
  FeedBroadcastPayload,
  getFeedTopic,
} from "./getSupabaseClient";

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
      });

    return () => {
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
    reconnectModal: null,
  };
}
