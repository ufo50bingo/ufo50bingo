import { Difficulty } from "@/app/goals";
import {
  Affix,
  Button,
  Card,
  Checkbox,
  Drawer,
  Stack,
} from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { useState } from "react";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { Ding } from "./useDings";
import RequestPauseButton from "./RequestPauseButton";
import ColorSelector from "../common/ColorSelector";
import DisconnectButton from "../common/DisconnectButton";
import TimerEdit from "../common/TimerEdit";
import { TimerState } from "../common/useMatchTimer";
import EditDings from "../common/EditDings";

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
}: Props) {
  const [isShown, setIsShown] = useState(color == null);
  return (
    <>
      <Affix position={{ top: 6, right: 6 }}>
        <Button
          leftSection={<IconSettings size={16} />}
          onClick={() => setIsShown(true)}
          size="xs"
        >
          Tools
        </Button>
      </Affix>
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
          <Drawer.Body>
            <Stack>
              <span>
                <strong>Seed: {seed}</strong>
              </span>
              <ColorSelector
                label="Choose color"
                color={color}
                setColor={setColor}
              />
              <RequestPauseButton id={id} />
              <TimerEdit state={timerState} setState={setTimerState} />
              <Button
                component="a"
                href={`https://www.bingosync.com/room/${id}`}
              >
                View Bingosync room
              </Button>
              <Card shadow="sm" padding="sm" radius="md" withBorder={true}>
                <Checkbox
                  checked={shownDifficulties.includes("general")}
                  onChange={(event) =>
                    setShownDifficulties(
                      event.target.checked ? ["general"] : []
                    )
                  }
                  label="Label general goals"
                />
              </Card>
              <EditDings dings={dings} setDings={setDings} />
              <DisconnectButton />
            </Stack>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
}
