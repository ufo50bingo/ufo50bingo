"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
import { AppShell, Burger, Group, Image, NavLink, Text } from "@mantine/core";
import {
  IconCalendarWeek,
  IconDeviceGamepad,
  IconExternalLink,
  IconFilter,
  IconHelp,
  IconPlaylistAdd,
  IconScoreboard,
  IconScript,
  IconSettings,
  IconTournament,
  IconVs,
} from "@tabler/icons-react";
import { usePathname } from "next/navigation";

const LINKS = [
  {
    href: "/about",
    text: "How to Play",
    icon: <IconHelp size={25} stroke={1.5} />,
  },
  {
    href: "/",
    text: "Create Match",
    icon: <IconVs size={25} stroke={1.5} />,
  },
  {
    href: "/matches",
    text: "Matches",
    icon: <IconScoreboard size={25} stroke={1.5} />,
  },
  {
    href: "/schedule",
    text: "Schedule",
    icon: <IconCalendarWeek size={25} stroke={1.5} />,
  },
  {
    href: "/resources",
    text: "Resources",
    icon: <IconScript size={25} stroke={1.5} />,
  },
  {
    href: "/practice",
    text: "Practice",
    icon: <IconDeviceGamepad size={25} stroke={1.5} />,
  },
  // {
  //   href: "/practiceboard",
  //   text: "Practice Board",
  //   icon: <IconDeviceGamepad size={25} stroke={1.5} />,
  // },
  {
    href: "/playlist",
    text: "Playlist",
    icon: <IconPlaylistAdd size={25} stroke={1.5} />,
  },
  {
    href: "/goals",
    text: "All Goals",
    icon: <IconFilter size={25} stroke={1.5} />,
  },
  {
    href: "/settings",
    text: "Settings",
    icon: <IconSettings size={25} stroke={1.5} />,
  },
  {
    href: "https://docs.google.com/spreadsheets/d/1FwNEMlF1KPdVADiPP539y2a2mDiyHpmoQclALHK9nCA/edit?gid=521253915#gid=521253915",
    text: "League",
    icon: <IconTournament size={25} stroke={1.5} />,
    isNewTab: true,
  },
  // {
  //   href: '/boardanalyzer',
  //   text: 'Board Analyzer',
  //   icon: <IconBorderAll size={12} />,
  // },
];

type Props = {
  children?: ReactNode;
};

export default function Shell({ children }: Props) {
  const [isCollapsedMobile, setIsCollapsedMobile] = useState(true);
  const pathname = usePathname();
  const page = LINKS.find((data) => data.href === pathname);
  let title = page?.text;
  if (title == null && pathname.startsWith("/match/")) {
    title = "Matches";
  } else if (title == null && pathname.startsWith("/cast/")) {
    return <div style={{ padding: '16px' }}>{children}</div>;
  }

  return (
    <AppShell
      header={{ height: 45 }}
      navbar={{
        width: 160,
        breakpoint: "sm",
        collapsed: { mobile: isCollapsedMobile },
      }}
      padding="md"
      footer={{ height: "24px" }}
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger
            opened={!isCollapsedMobile}
            onClick={() => setIsCollapsedMobile(!isCollapsedMobile)}
            size="sm"
            hiddenFrom="sm"
          />
          <div>
            <Image src="/logo.png" alt="" height={25} width={25} />
          </div>
          <span>
            {title != null ? `UFO 50 Bingo — ${title}` : "UFO 50 Bingo"}
          </span>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar>
        {LINKS.map((data) => (
          <NavLink
            key={data.href}
            active={
              data.href === pathname ||
              (data.href === "/matches" && pathname.startsWith("/match/"))
            }
            component={Link}
            href={data.href}
            leftSection={data.icon}
            rightSection={
              data.isNewTab ? (
                <IconExternalLink size={25} stroke={1.5} />
              ) : undefined
            }
            label={data.text}
            onClick={() => setIsCollapsedMobile(true)}
            target={data.isNewTab ? "_blank" : undefined}
          />
        ))}
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
      <AppShell.Footer>
        <div style={{ padding: "4px" }}>
          <Group justify="center">
            <Text size="xs">
              Made by Frank — Suggestions? Tag me in{" "}
              <a href="https://discord.gg/zj2HQGaN" target="_blank">
                #bingo-chat on the discord
              </a>
            </Text>
          </Group>
        </div>
      </AppShell.Footer>
    </AppShell>
  );
}
