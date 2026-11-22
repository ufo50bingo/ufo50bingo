import { Avatar, Group, Text } from "@mantine/core";
import Link from "next/link";
import { ReactNode } from "react";
import classes from "./MatchRow.module.css";

type Props = {
  // 0 for a placeholder that isn't a real user (no link)
  userId: number;
  name: string;
  image: null | string;
  size: "md" | "lg";
  isDimmed?: boolean;
  isBold?: boolean;
};

export default function MemberLink({
  userId,
  name,
  image,
  size,
  isDimmed = false,
  isBold = false,
}: Props) {
  const nameEl: ReactNode = isBold ? <strong>{name}</strong> : name;
  return (
    <Group gap={6} wrap="nowrap" miw={0}>
      <Avatar
        name={name}
        src={image}
        color="initials"
        size={size === "md" ? 20 : 24}
        radius="xl"
        style={{ flexShrink: 0 }}
        imageProps={{ draggable: false }}
      />
      <Text
        size={size === "md" ? "sm" : "md"}
        c={isDimmed ? "dimmed" : undefined}
        className={classes.name}
      >
        {userId === 0 ? (
          nameEl
        ) : (
          <Link
            href={`/user/${userId}`}
            target="_blank"
            prefetch={false}
            draggable={false}
            className={classes.playerLink}
          >
            {nameEl}
          </Link>
        )}
      </Text>
    </Group>
  );
}
