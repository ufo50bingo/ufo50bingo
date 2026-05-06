import useLocalEnum from "@/app/localStorage/useLocalEnum";
import { SetSoundChoices, SoundChoices } from "../common/NotificationsSection";
import { RoomView } from "../roomCookie";
import { Sound, SOUNDS } from "../common/sounds";
import { useCallback, useMemo } from "react";

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

  const pauseAudio = useMemo(
    () =>
      soundChoices.pause != null ? new Audio(SOUNDS[soundChoices.pause]) : null,
    [soundChoices.pause],
  );
  const squareAudio = useMemo(
    () =>
      soundChoices.square != null
        ? new Audio(SOUNDS[soundChoices.square])
        : null,
    [soundChoices.square],
  );
  const chatAudio = useMemo(
    () =>
      soundChoices.chat != null ? new Audio(SOUNDS[soundChoices.chat]) : null,
    [soundChoices.chat],
  );

  const playAudio = useCallback(
    (soundType: keyof SoundChoices) => {
      let audio: null | HTMLAudioElement = null;
      switch (soundType) {
        case "pause":
          audio = pauseAudio;
          break;
        case "chat":
          audio = chatAudio;
          break;
        case "square":
          audio = squareAudio;
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
    },
    [pauseAudio, squareAudio, chatAudio],
  );

  return [soundChoices, setSoundChoices, playAudio];
}
