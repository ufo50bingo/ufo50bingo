import { Difficulty, DIFFICULTY_NAMES, ORDERED_DIFFICULTY } from "@/app/goals";
import {
  Accordion,
  Alert,
  Button,
  Checkbox,
  Drawer,
  Stack,
  Text,
} from "@mantine/core";
import { IconAlertSquareRounded, IconSettings } from "@tabler/icons-react";
import { useState } from "react";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import ColorSelector from "../common/ColorSelector";
import NotificationsSection, {
  SetSoundChoices,
  SoundChoices,
} from "../common/NotificationsSection";
import { Font } from "@/app/font/useFont";
import FontSelector from "@/app/font/FontSelector";
import SelectRightClickBehavior from "@/app/settings/SelectRightClickBehavior";
import { SyncedTimerState } from "../common/useSyncedTimer";
import TimerSection from "../common/TimerSection";
import RevealSection from "./RevealSection";
import { useShouldShortenContext } from "@/app/settings/ShouldShortenContext";
import GeneralSection, {
  GeneralSettings,
  GeneralSetters,
} from "./GeneralSection";
import { useShouldShowRecentContext } from "@/app/settings/ShouldShowRecentContext";
import { FeedPlayerColorChange, NewFeedItem } from "@/app/fetchFeed";
import PlayerMembersSection from "./PlayerMembersSection";
import {
  PlayerMember,
  CasterMember,
  GenericMember,
} from "../common/useMembers";
import { useServerOffsetContext } from "../ServerOffsetContext";
import BottomSection from "../common/BottomSection";
import { PlayerTrackerRestrictions } from "@/app/generator/ufoGenerator";

type Props = {
  userId: number;
  color: null | BingosyncColor;
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
  forceReveal: () => unknown;
  generalSettings: GeneralSettings;
  restrictions: PlayerTrackerRestrictions;
  generalSetters: GeneralSetters;
  sendEvents: (newEvent: ReadonlyArray<NewFeedItem>) => Promise<boolean>;
  players: ReadonlyArray<PlayerMember>;
  casters: ReadonlyArray<CasterMember>;
  members: ReadonlyMap<number, GenericMember>;
};

export default function PlaySettings({
  userId,
  color,
  shownDifficulties,
  setShownDifficulties,
  soundChoices,
  setSoundChoices,
  isMobile,
  showGeneralTracker,
  setShowGeneralTracker,
  font,
  setFont,
  timerState,
  forceReveal,
  restrictions,
  generalSetters,
  generalSettings,
  sendEvents,
  players,
  casters,
  members,
}: Props) {
  const [isShown, setIsShown] = useState(color == null);
  const { getServerMsFromClientMs } = useServerOffsetContext();
  const { shouldShortenPlay, setShouldShortenPlay } = useShouldShortenContext();
  const { shouldShowRecentPlay, setShouldShowRecentPlay } =
    useShouldShowRecentContext();
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
            <Accordion multiple={true}>
              <PlayerMembersSection players={players} casters={casters} />
              <Accordion.Item value="color">
                <Accordion.Control>Select Color</Accordion.Control>
                <Accordion.Panel>
                  <ColorSelector
                    label={null}
                    color={color}
                    setColor={async (newColor: BingosyncColor) => {
                      const event: FeedPlayerColorChange = {
                        type: "player_color_change",
                        userId,
                        playerColor: newColor,
                        time: getServerMsFromClientMs(Date.now()) / 1000,
                      };
                      await sendEvents([event]);
                    }}
                  />
                </Accordion.Panel>
              </Accordion.Item>
              <TimerSection
                userId={userId}
                timerState={timerState}
                isMobile={isMobile}
                sendEvents={sendEvents}
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
                        setShouldShortenPlay(event.target.checked)
                      }
                      label="Show shortened goal text when possible"
                    />
                    {shouldShortenPlay && (
                      <Alert color="yellow" icon={<IconAlertSquareRounded />}>
                        Shortened goals may leave out important information.
                        <br />
                        You should only use shortened goal text if you are
                        comfortable with the entire goal set.
                      </Alert>
                    )}
                    <Checkbox
                      checked={shouldShowRecentPlay}
                      onChange={(event) =>
                        setShouldShowRecentPlay(event.target.checked)
                      }
                      label="Highlight opponent's recently-claimed squares"
                    />
                    <Text size="sm">Display difficulty tags for:</Text>
                    {ORDERED_DIFFICULTY.filter(
                      (difficulty) =>
                        restrictions.allowed_difficulty_tags == null ||
                        restrictions.allowed_difficulty_tags.includes(
                          difficulty,
                        ),
                    ).map((difficulty) => (
                      <Checkbox
                        key={difficulty}
                        checked={shownDifficulties.includes(difficulty)}
                        onChange={(event) =>
                          setShownDifficulties(
                            event.currentTarget.checked
                              ? [...shownDifficulties, difficulty]
                              : shownDifficulties.filter(
                                  (d) => d !== difficulty,
                                ),
                          )
                        }
                        label={DIFFICULTY_NAMES[difficulty]}
                      />
                    ))}
                    <FontSelector font={font} setFont={setFont} />
                    <SelectRightClickBehavior
                      label="Square right click behavior"
                      isCast={false}
                    />
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
              <GeneralSection
                generalSettings={generalSettings}
                generalSetters={generalSetters}
                restrictions={restrictions}
                showGeneralTracker={showGeneralTracker}
                setShowGeneralTracker={setShowGeneralTracker}
              />
            </Accordion>
            <BottomSection
              userId={userId}
              members={members}
              isCast={false}
              isMobile={false}
              sendEvents={sendEvents}
            />
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
}
