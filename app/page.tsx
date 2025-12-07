"use client";

import {
  Container,
  Stack,
  Title,
  Card,
  Text,
  SegmentedControl,
  Tooltip,
} from "@mantine/core";
import Link from "next/link";
import { useState } from "react";
import NonLeagueMatch from "./createboard/NonLeagueMatch";
import LeagueMatch from "./createboard/LeagueMatch";
import { LEAGUE_SEASON } from "./createboard/leagueConstants";

export default function CreateBoard() {
  const [matchType, setMatchType] = useState<"league" | "non-league" | null>(
    LEAGUE_SEASON == null ? "non-league" : null
  );

  return (
    <Container my="md">
      <Stack gap={8}>
        <Card shadow="sm" padding="sm" radius="md" withBorder>
          <Card.Section withBorder={true} inheritPadding={true} py="xs">
            <Stack gap={8}>
              <Title order={1}>Create a UFO 50 Bingo Match</Title>
              <Text>
                Use this page to create a UFO 50 Bingo Match! If you're new to
                Bingo, check out the <Link href="/about">How to Play</Link> page
                first!
              </Text>
              <Text>
                If you want to create an unofficial match with the same goals as
                a League match, use the default settings of the Non-League
                section.
              </Text>
              <Text>
                <strong>Is this an official league match?</strong>
              </Text>
              <SegmentedControl
                data={[
                  {
                    value: "league",
                    label: LEAGUE_SEASON == null ? (
                      <Tooltip label="League play is not open yet!">
                        <span>League</span>
                      </Tooltip>
                    ) : (
                      "League"
                    ),
                    disabled: LEAGUE_SEASON == null,
                  },
                  { value: "non-league", label: "Non-League" },
                ]}
                fullWidth={true}
                onChange={setMatchType as unknown as (value: string) => void}
                value={matchType as unknown as string}
              />
            </Stack>
          </Card.Section>
          {matchType != null && (
            <Card.Section withBorder={true} inheritPadding={true} py="xs">
              {/* Using divs with display style to state doesn't get cleared if you change to the other type */}
              <div
                style={{ display: matchType === "league" ? undefined : "none" }}
              >
                <LeagueMatch />
              </div>
              <div
                style={{
                  display: matchType === "non-league" ? undefined : "none",
                }}
              >
                <NonLeagueMatch />
              </div>
            </Card.Section>
          )}
        </Card>
      </Stack>
    </Container>
  );
}
