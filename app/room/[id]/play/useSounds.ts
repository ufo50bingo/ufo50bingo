import useLocalEnum from "@/app/localStorage/useLocalEnum";
import { SetSoundChoices, SoundChoices } from "../common/NotificationsSection";
import { RoomView } from "../roomCookie";
import { Sound, SOUNDS } from "../common/sounds";
import { useMemo } from "react";

const SOUND_OPTIONS: ReadonlyArray<"None" | Sound> = [
  "None",
  ...(Object.keys(SOUNDS) as Array<Sound>),
];

export default function useSounds(
  view: RoomView
): [SoundChoices, SetSoundChoices] {
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

  const soundChoices = useMemo(() => ({
    pause: pauseRaw === "None" ? null : pauseRaw,
    square: squareRaw === "None" ? null : squareRaw,
    chat: chatRaw === "None" ? null : chatRaw,
  }), [pauseRaw, squareRaw, chatRaw]);

  const SetSoundChoices = useMemo(() => ({
    setPause: (newSound: null | Sound) => setPauseRaw(newSound ?? "None"),
    setSquare: (newSound: null | Sound) => setSquareRaw(newSound ?? "None"),
    setChat: (newSound: null | Sound) => setChatRaw(newSound ?? "None"),
  }), []);

  return [soundChoices, SetSoundChoices];
}
