"use client";

import { ReactNode, useState } from "react";
import {
  AppShell,
  Burger,
  Group,
  Image,
  NavLink,
  Select,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconBuildingTunnel,
  IconCalendarWeek,
  IconClock24,
  IconDeviceGamepad,
  IconFilter,
  IconHelp,
  IconPepper,
  IconPlaylistAdd,
  IconScoreboard,
  IconScript,
  IconSettings,
  IconTournament,
  IconVs,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import LinkWithVariant from "./links/LinkWithVariant";
import {
  usePracticeVariant,
  PRACTICE_VARIANTS,
} from "./PracticeVariantContext";

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
    href: "/daily",
    text: "Daily",
    icon: <IconClock24 size={25} stroke={1.5} />,
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
    href: "/league",
    text: "League",
    icon: <IconTournament size={25} stroke={1.5} />,
    isNewTab: true,
  },
  {
    href: "/underground",
    text: "Underground",
    icon: <IconBuildingTunnel size={25} stroke={1.5} />,
    isNewTab: true,
  },
  {
    href: "/spicy",
    text: "Spicy",
    icon: <IconPepper size={25} stroke={1.5} />,
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
  const router = useRouter();
  const pv = usePracticeVariant();
  const pathname = usePathname();
  const page = LINKS.find((data) => data.href === pathname);
  let title = page?.text;
  if (title == null && pathname.startsWith("/match/")) {
    title = "Matches";
  } else if (title == null && pathname.startsWith("/room/")) {
    return <div style={{ padding: "16px" }}>{children}</div>;
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
            component={LinkWithVariant}
            href={data.href}
            leftSection={data.icon}
            label={data.text}
            onClick={() => setIsCollapsedMobile(true)}
            target={data.isNewTab ? "_blank" : undefined}
          />
        ))}
        <Tooltip label="Used on the Practice and All Goals tabs">
          <div
            style={{
              paddingTop: "8px",
              paddingBottom: "8px",
              paddingLeft: "12px",
              paddingRight: "12px",
            }}
          >
            <Select
              value={pv}
              onChange={(newValue) => {
                const url = new URL(window.location.href);
                if (newValue !== "standard" && newValue) {
                  url.searchParams.set("v", newValue);
                } else {
                  url.searchParams.delete("v");
                }
                router.push(url.toString());
              }}
              data={Object.keys(PRACTICE_VARIANTS).map((key) => ({
                value: key,
                label: PRACTICE_VARIANTS[key as keyof typeof PRACTICE_VARIANTS],
              }))}
              label="Practice Variant"
            />
          </div>
        </Tooltip>
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
      <AppShell.Footer>
        <div style={{ padding: "4px" }}>
          <Group justify="center">
            <Text size="xs">
              Made by Frank — Suggestions? Tag me in{" "}
              <a
                href="https://discord.com/channels/525973026429206530/1332514343899627591"
                target="_blank"
              >
                #bingo-chat
              </a>{" "}
              on the <a href="https://50games.fans">discord</a>
            </Text>
          </Group>
        </div>
      </AppShell.Footer>
    </AppShell>
  );
}
