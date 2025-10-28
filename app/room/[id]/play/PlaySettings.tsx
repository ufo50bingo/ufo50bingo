import { Difficulty } from "@/app/goals";
import {
  Accordion,
  Affix,
  Button,
  Card,
  Checkbox,
  Drawer,
} from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { useState } from "react";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { Ding } from "./useDings";
import ColorSelector from "../common/ColorSelector";
import TimerSection from "../common/TimerSection";
import { TimerState } from "../common/useMatchTimer";
import NotificationsSection from "../common/NotificationsSection";
import RequestPauseSection from "../common/RequestPauseSection";
import CountdownSection from "../common/CountdownSection";
import CreateBoardSection from "../common/CreateBoardSection";
import BottomSection from "../common/BottomSection";

type Props = {
  id: string;
  seed: number;
  color: null | BingosyncColor;
  setColor: (newcolor: BingosyncColor) => unknown;
  shownDifficulties: ReadonlyArray<Difficulty>;
  setShownDifficulties: (newShown: ReadonlyArray<Difficulty>) => unknown;
  dings: ReadonlyArray<Ding>;
  setDings: (newDings: ReadonlyArray<Ding>) => unknown;
  timerState: TimerState;
  setTimerState: (newState: TimerState) => unknown;
  isMobile: boolean;
};

export default function PlaySettings({
  id,
  color,
  setColor,
  seed,
  shownDifficulties,
  setShownDifficulties,
  dings,
  setDings,
  timerState,
  setTimerState,
  isMobile,
}: Props) {
  const [isShown, setIsShown] = useState(color == null);
  return (
    <>
      <Button
        leftSection={<IconSettings size={16} />}
        onClick={() => setIsShown(true)}
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
            <Accordion multiple={true} defaultValue={color == null ? ["color"] : []}>
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
              <RequestPauseSection id={id} />
              <TimerSection state={timerState} setState={setTimerState} isMobile={isMobile} />
              <CountdownSection view="play" />
              <NotificationsSection dings={dings} setDings={setDings} />
              {/* TODO Store directory handle in local state!!!*/}
              <Accordion.Item value="display">
                <Accordion.Control>Display Settings</Accordion.Control>
                <Accordion.Panel>
                  <Checkbox
                    checked={shownDifficulties.includes("general")}
                    onChange={(event) =>
                      setShownDifficulties(
                        event.target.checked ? ["general"] : []
                      )
                    }
                    label="Label general goals"
                  />
                </Accordion.Panel>
              </Accordion.Item>
              <CreateBoardSection id={id} isMobile={isMobile} />
            </Accordion>
            <BottomSection id={id} isMobile={isMobile} />
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root >
    </>
  );
}
