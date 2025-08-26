"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconBorderAll,
  IconDeviceGamepad,
  IconFilter,
  IconHelp,
  IconPlaylistAdd,
  IconScoreboard,
  IconScript,
  IconSettings,
  IconTournament,
  IconVs,
} from "@tabler/icons-react";
import { Anchor, Box, Container, Group, Text } from "@mantine/core";
import classes from "./Nav.module.css";

const LINKS = [
  {
    href: "/about",
    text: "About",
    icon: <IconHelp size={12} />,
  },
  {
    href: "/",
    text: "Create Board",
    icon: <IconVs size={12} />,
  },
  {
    href: "/matches",
    text: "Matches",
    icon: <IconScoreboard size={12} />,
  },
  {
    href: "/resources",
    text: "Resources",
    icon: <IconScript size={12} />,
  },
  {
    href: "/practice",
    text: "Practice",
    icon: <IconDeviceGamepad size={12} />,
  },
  {
    href: "/goals",
    text: "All Goals",
    icon: <IconFilter size={12} />,
  },
  {
    href: "/playlist",
    text: "Playlist",
    icon: <IconPlaylistAdd size={12} />,
  },
  {
    href: "/settings",
    text: "Settings",
    icon: <IconSettings size={12} />,
  },
  {
    href: "https://docs.google.com/spreadsheets/d/1FwNEMlF1KPdVADiPP539y2a2mDiyHpmoQclALHK9nCA/edit?gid=521253915#gid=521253915",
    text: "League",
    icon: <IconTournament size={12} />,
    isNewTab: true,
  },
  // {
  //   href: '/boardanalyzer',
  //   text: 'Board Analyzer',
  //   icon: <IconBorderAll size={12} />,
  // },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <header className={classes.header}>
      <Container className={classes.inner}>
        <Group gap={0} justify="flex-end">
          {LINKS.map(({ href, text, icon, isNewTab }) => (
            <Anchor
              key={href}
              component={Link}
              href={href}
              className={classes.mainLink}
              data-active={pathname === href || undefined}
              target={isNewTab === true ? "_blank" : undefined}
            >
              <Group gap={8}>
                {icon}
                <Text size="sm">{text}</Text>
              </Group>
            </Anchor>
          ))}
        </Group>
      </Container>
    </header>
  );
}
