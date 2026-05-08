import { Difficulty } from "@/app/goals";
import { Accordion, Alert, Button, Checkbox, Drawer, Stack } from "@mantine/core";
import { IconAlertSquareRounded, IconSettings } from "@tabler/icons-react";
import { useState } from "react";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import ColorSelector from "../common/ColorSelector";
import NotificationsSection, {
  SetSoundChoices,
  SoundChoices,
} from "../common/NotificationsSection";
import CreateBoardSection from "../common/CreateBoardSection";
import BottomSection from "../common/BottomSection";
import { Font } from "@/app/font/useFont";
import FontSelector from "@/app/font/FontSelector";
import SelectRightClickBehavior from "@/app/settings/SelectRightClickBehavior";
import { FullSyncedTimerEvent, SyncedTimerState } from "../common/useSyncedTimer";
import TimerSection from "../common/TimerSection";
import RevealSection from "./RevealSection";
import { useShouldShortenContext } from "@/app/settings/ShouldShortenContext";

type Props = {
  id: string;
  color: null | BingosyncColor;
  setColor: (newcolor: BingosyncColor) => unknown;
  shownDifficulties: ReadonlyArray<Difficulty>;
  setShownDifficulties: (newShown: ReadonlyArray<Difficulty>) => unknown;
  soundChoices: SoundChoices;
  setSoundChoices: SetSoundChoices;
  isMobile: boolean;
  showGeneralTracker: boolean;
  setShowGeneralTracker: (newShown: boolean) => unknown;
  font: Font;
  setFont: (newFont: Font) => unknown;
  timerState: SyncedTimerState;
  addEvent: (newEvent: FullSyncedTimerEvent) => Promise<void>;
  seed: number;
  forceReveal: () => unknown;
};

export default function PlaySettings({
  id,
  color,
  setColor,
  shownDifficulties,
  setShownDifficulties,
  soundChoices,
  setSoundChoices,
  isMobile,
  showGeneralTracker,
  setShowGeneralTracker,
  font,
  setFont,
  addEvent,
  seed,
  timerState,
  forceReveal,
}: Props) {
  const [isShown, setIsShown] = useState(color == null);
  const { shouldShortenPlay, setShouldShortenPlay } = useShouldShortenContext();
  return (
    <>
      <Button
        leftSection={<IconSettings size={16} />}
        onClick={() => setIsShown(true)}
        fullWidth={true}
      >
        Tools
      </Button>
      <Drawer.Root
        position="right"
        opened={isShown}
        onClose={() => setIsShown(false)}
        size={300}
        keepMounted={true}
      >
        <Drawer.Overlay backgroundOpacity={0} />
        <Drawer.Content style={{ boxShadow: "-0.2em 0 0.4em black" }}>
          <Drawer.Header>
            <Drawer.Title>Tools</Drawer.Title>
            <Drawer.CloseButton />
          </Drawer.Header>
          <Drawer.Body p={0}>
            <Accordion
              multiple={true}
              defaultValue={color == null ? ["color"] : []}
            >
              <Accordion.Item value="color">
                <Accordion.Control>Select Color</Accordion.Control>
                <Accordion.Panel>
                  <ColorSelector
                    label="Choose color"
                    color={color}
                    setColor={setColor}
                  />
                </Accordion.Panel>
              </Accordion.Item>
              <TimerSection
                timerState={timerState}
                addEvent={addEvent}
                seed={seed}
                isMobile={isMobile}
              />
              <RevealSection forceReveal={forceReveal} />
              <NotificationsSection
                soundChoices={soundChoices}
                setSoundChoices={setSoundChoices}
              />
              <Accordion.Item value="display">
                <Accordion.Control>Display Settings</Accordion.Control>
                <Accordion.Panel>
                  <Stack>
                    <Checkbox
                      checked={shouldShortenPlay}
                      onChange={(event) =>
                        setShouldShortenPlay(
                          event.target.checked,
                        )
                      }
                      label="Show shortened goal text when possible"
                    />
                    {shouldShortenPlay && <Alert color="yellow" icon={<IconAlertSquareRounded />}>
                      Shortened goals may leave out important information.{' '}
                      You should only use shortened goal text if you are comfortable with the entire goal set.
                    </Alert>}
                    <Checkbox
                      checked={shownDifficulties.includes("general")}
                      onChange={(event) =>
                        setShownDifficulties(
                          event.target.checked ? ["general"] : [],
                        )
                      }
                      label="Label general goals"
                    />
                    <Checkbox
                      checked={showGeneralTracker}
                      onChange={(event) =>
                        setShowGeneralTracker(event.target.checked)
                      }
                      label="Show general goal tracker"
                    />
                    <FontSelector font={font} setFont={setFont} />
                    <SelectRightClickBehavior label="Square right click behavior" />
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
              <CreateBoardSection id={id} isMobile={isMobile} />
            </Accordion>
            <BottomSection id={id} isMobile={isMobile} />
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
}
