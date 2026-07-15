import {
  ActionIcon,
  Button,
  ColorPicker,
  Input,
  List,
  Select,
  Stack,
} from "@mantine/core";
import { RightClickBehavior } from "./useRightClickBehavior";
import { useRightClickBehaviorContext } from "./RightClickBehaviorContext";
import { useAppContext } from "../AppContextProvider";
import { IconX } from "@tabler/icons-react";
import React from "react";

type Props = {
  label?: string;
};

const DATA = [
  { value: "star", label: "Star" },
  { value: "my_color", label: "Highlight in my color" },
  { value: "custom_color", label: "Highlight in custom color" },
];

export default function SelectRightClickBehavior({ label }: Props) {
  const {
    rightClickBehavior,
    setRightClickBehavior,
    customColor,
    setCustomColor,
  } = useRightClickBehaviorContext();
  const { isMounted } = useAppContext();
  return (
    <Input.Wrapper label={label}>
      <Stack gap={16}>
        <List spacing="sm" size="sm" listStyleType="none">
          {rightClickBehavior.map((behavior, idx) => (
            <List.Item
              key={idx}
              icon={
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => {
                    if (rightClickBehavior.length < 2) {
                      return;
                    }
                    setRightClickBehavior(
                      rightClickBehavior.filter((_, i) => i !== idx),
                    );
                  }}
                  disabled={rightClickBehavior.length < 2}
                >
                  <IconX stroke={2} size={16} />
                </ActionIcon>
              }
              styles={{
                itemWrapper: { alignItems: "flex-start" },
                itemIcon: { marginTop: "4px" },
              }}
            >
              <Stack gap={4}>
                <Select
                  value={behavior.type}
                  data={DATA}
                  onChange={(value) => {
                    const typed = value as RightClickBehavior["type"];
                    switch (typed) {
                      case "star":
                        setRightClickBehavior(
                          updateAt(rightClickBehavior, { type: "star" }, idx),
                        );
                        break;
                      case "my_color":
                        setRightClickBehavior(
                          updateAt(
                            rightClickBehavior,
                            { type: "my_color" },
                            idx,
                          ),
                        );
                        break;
                      case "custom_color":
                        setRightClickBehavior(
                          updateAt(
                            rightClickBehavior,
                            { type: "custom_color", color: customColor },
                            idx,
                          ),
                        );
                        break;
                    }
                  }}
                />
                {isMounted && behavior.type === "custom_color" && (
                  <ColorPicker
                    w={208}
                    value={behavior.color}
                    onChange={(newColor: string) => {
                      setCustomColor(newColor);
                      setRightClickBehavior(
                        updateAt(
                          rightClickBehavior,
                          { type: "custom_color", color: newColor },
                          idx,
                        ),
                      );
                    }}
                  />
                )}
              </Stack>
            </List.Item>
          ))}
          <List.Item>
            <Button
              onClick={() =>
                setRightClickBehavior([...rightClickBehavior, { type: "star" }])
              }
            >
              Add item
            </Button>
          </List.Item>
        </List>
      </Stack>
    </Input.Wrapper>
  );
}

function updateAt(
  oldBehaviors: ReadonlyArray<RightClickBehavior>,
  newBehavior: RightClickBehavior,
  idx: number,
): ReadonlyArray<RightClickBehavior> {
  const newBehaviors = [...oldBehaviors];
  newBehaviors[idx] = newBehavior;
  return newBehaviors;
}
