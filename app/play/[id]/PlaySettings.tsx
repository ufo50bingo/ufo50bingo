import { Difficulty } from "@/app/goals";
import {
  Affix,
  Button,
  Card,
  Checkbox,
  Drawer,
  Group,
  Modal,
  Stack,
  Text,
} from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { useState } from "react";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { usePathname } from "next/navigation";
import ColorSelector from "@/app/cast/[id]/ColorSelector";
import { Ding } from "./useDings";
import DisconnectButton from "@/app/cast/[id]/DisconnectButton";

type Props = {
  id: string;
  seed: number;
  color: null | BingosyncColor;
  setColor: (newcolor: BingosyncColor) => unknown;
  shownDifficulties: ReadonlyArray<Difficulty>;
  setShownDifficulties: (newShown: ReadonlyArray<Difficulty>) => unknown;
  dings: ReadonlyArray<Ding>;
  setDings: (newDings: ReadonlyArray<Ding>) => unknown;
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
              <Card shadow="sm" padding="sm" radius="md" withBorder={true}>
                <Stack>
                  <Text size="sm">Play chime for:</Text>
                  <Checkbox
                    checked={dings.includes("chat")}
                    onChange={(event) =>
                      setDings(
                        event.currentTarget.checked
                          ? [...dings, "chat"]
                          : dings.filter((d) => d !== "chat")
                      )
                    }
                    label="Chat messages"
                  />
                  <Checkbox
                    checked={dings.includes("square")}
                    onChange={(event) =>
                      setDings(
                        event.currentTarget.checked
                          ? [...dings, "square"]
                          : dings.filter((d) => d !== "square")
                      )
                    }
                    label="Square claimed"
                  />
                </Stack>
              </Card>
              <Button
                component="a"
                href={`https://www.bingosync.com/room/${id}`}
              >
                View Bingosync room
              </Button>
              <DisconnectButton />
            </Stack>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
}
