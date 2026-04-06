import { Stack, Checkbox, Text, Accordion } from "@mantine/core";
import SoundSelector from "./SoundSelector";
import { Sound } from "./sounds";

type Props = {
  soundChoices: SoundChoices;
  setSoundChoices: SetSoundChoices;
};

export type SoundChoices = {
  pause: null | Sound,
  chat: null | Sound,
  square: null | Sound,
};

export type SetSoundChoices = {
  setPause: (newSound: null | Sound) => unknown;
  setSquare: (newSound: null | Sound) => unknown;
  setChat: (newSound: null | Sound) => unknown;
};

export default function NotificationsSection({ soundChoices, setSoundChoices }: Props) {
  return (
    <Accordion.Item value="notifications">
      <Accordion.Control>Notifications</Accordion.Control>
      <Accordion.Panel>
        <Stack>
          <SoundSelector label="Pause requested" sound={soundChoices.pause} setSound={setSoundChoices.setPause} />
          <SoundSelector label="Square claimed" sound={soundChoices.square} setSound={setSoundChoices.setSquare} />
          <SoundSelector label="Chat received" sound={soundChoices.chat} setSound={setSoundChoices.setChat} />
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
