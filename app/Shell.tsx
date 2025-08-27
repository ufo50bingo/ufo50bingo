"use client";

import { ReactNode } from "react";
import { AppShell, Group, Text } from "@mantine/core";

type Props = {
  children?: ReactNode;
};

export default function Shell({ children }: Props) {
  return (
    <AppShell footer={{ height: "24px" }}>
      <AppShell.Main>{children}</AppShell.Main>
      <AppShell.Footer>
        <div style={{ padding: "4px" }}>
          <Group justify="center">
            <Text size="xs">
              Made by Frank — Got suggestions? Tag me in the{" "}
              <a href="https://discord.gg/zj2HQGaN" target="_blank">
                #bingo-chat channel on the UFO 50 discord
              </a>
            </Text>
          </Group>
        </div>
      </AppShell.Footer>
    </AppShell>
  );
}
