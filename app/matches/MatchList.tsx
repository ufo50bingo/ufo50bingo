"use client";

import { Card, Container, Group, Pagination, Stack, Text } from "@mantine/core";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MatchRow } from "./MatchRow";
import { FullParsedGame } from "../fetchFeed";
import { useAppContext } from "../AppContextProvider";
import { useMediaQuery } from "@mantine/hooks";

type Props = {
  games: ReadonlyArray<FullParsedGame>;
  totalPages: number;
};

function parsePage(raw: string | null, totalPages: number): number {
  const n = raw == null ? 1 : parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) {
    return 1;
  }
  return Math.min(n, Math.max(1, totalPages));
}

export function MatchList({ games, totalPages }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isMounted, hideByDefault, setHideByDefault, revealedMatchIDs } =
    useAppContext();

  // 525px is the width of the board, which is also the default width of the modal
  const isMobile = useMediaQuery("(max-width: 525px)");

  const page = parsePage(searchParams.get("page"), totalPages);

  const onPageChange = (next: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(next));
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  if (!isMounted || (hideByDefault && revealedMatchIDs == null)) {
    return null;
  }
  return (
    <Container my="md">
      <Stack gap="sm">
        {games.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No matches found.
          </Text>
        ) : (
          <Card
            withBorder
            shadow="sm"
            radius="md"
            padding={0}
            style={{ overflow: "hidden" }}
          >
            {games.map((g) => (
              <MatchRow key={g.game.id} game={g} isMobile={isMobile} />
            ))}
          </Card>
        )}
        <Group justify="flex-end">
          <Pagination
            size="sm"
            total={Math.max(1, totalPages)}
            value={page}
            onChange={onPageChange}
          />
        </Group>
      </Stack>
    </Container>
  );
}
