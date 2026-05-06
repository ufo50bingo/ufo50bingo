import useLocalEnum from "@/app/localStorage/useLocalEnum";
import { SetSoundChoices, SoundChoices } from "../common/NotificationsSection";
import { RoomView } from "../roomCookie";
import { Sound, SOUNDS } from "../common/sounds";
import { useCallback, useEffect, useMemo, useRef } from "react";

const SOUND_OPTIONS: ReadonlyArray<"None" | Sound> = [
  "None",
  ...(Object.keys(SOUNDS) as Array<Sound>),
];

export default function useSounds(
  view: RoomView,
): [SoundChoices, SetSoundChoices, (soundType: keyof SoundChoices) => void] {
  const [pauseRaw, setPauseRaw] = useLocalEnum({
    key: `${view}-pause`,
    options: SOUND_OPTIONS,
    defaultValue: "Alarm 1",
  });
  const [squareRaw, setSquareRaw] = useLocalEnum({
    key: `${view}-square`,
    options: SOUND_OPTIONS,
    defaultValue: "Chime 1",
  });
  const [chatRaw, setChatRaw] = useLocalEnum({
    key: `${view}-chat`,
    options: SOUND_OPTIONS,
    defaultValue: "Chime 2",
  });

  const soundChoices = useMemo(
    () => ({
      pause: pauseRaw === "None" ? null : pauseRaw,
      square: squareRaw === "None" ? null : squareRaw,
      chat: chatRaw === "None" ? null : chatRaw,
    }),
    [pauseRaw, squareRaw, chatRaw],
  );

  const setSoundChoices = useMemo(
    () => ({
      setPause: (newSound: null | Sound) => setPauseRaw(newSound ?? "None"),
      setSquare: (newSound: null | Sound) => setSquareRaw(newSound ?? "None"),
      setChat: (newSound: null | Sound) => setChatRaw(newSound ?? "None"),
    }),
    [setChatRaw, setPauseRaw, setSquareRaw],
  );

  const pauseAudioRef = useRef<HTMLAudioElement | null>(null);
  const squareAudioRef = useRef<HTMLAudioElement | null>(null);
  const chatAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    pauseAudioRef.current =
      soundChoices.pause != null ? new Audio(SOUNDS[soundChoices.pause]) : null;
  }, [soundChoices.pause]);
  useEffect(() => {
    squareAudioRef.current =
      soundChoices.square != null
        ? new Audio(SOUNDS[soundChoices.square])
        : null;
  }, [soundChoices.square]);
  useEffect(() => {
    chatAudioRef.current =
      soundChoices.chat != null ? new Audio(SOUNDS[soundChoices.chat]) : null;
  }, [soundChoices.chat]);

  const playAudio = useCallback((soundType: keyof SoundChoices) => {
    let audio: null | HTMLAudioElement = null;
    switch (soundType) {
      case "pause":
        audio = pauseAudioRef.current;
        break;
      case "chat":
        audio = chatAudioRef.current;
        break;
      case "square":
        audio = squareAudioRef.current;
        break;
      default:
        soundType satisfies never;
        break;
    }
    if (audio != null) {
      try {
        // eslint-disable-next-line react-hooks/immutability
        audio.currentTime = 0;
        audio.play();
      } catch {}
    }
  }, []);

  return [soundChoices, setSoundChoices, playAudio];
}
