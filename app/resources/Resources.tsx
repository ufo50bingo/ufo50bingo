"use client";

import { Alert, Card, Container, List, Title } from "@mantine/core";
import LinkWithVariant from "../links/LinkWithVariant";

export default function Resources() {
  return (
    <Container my="md">
      <Card shadow="sm" padding="sm" radius="md" withBorder>
        <Alert variant="light">
          <LinkWithVariant prefetch={false} href="/about">
            <Title order={5}>
              If you are new to UFO 50 Bingo, click here first!
            </Title>
          </LinkWithVariant>
        </Alert>
        <p>Bingo League</p>
        <List>
          <List.Item>
            <a
              href="https://docs.google.com/spreadsheets/d/1Vt8MZdfhG30km1kq04wChGYgJHCo3o-tXxkHpBUoZiw/edit?gid=521253915#gid=521253915"
              target="_blank"
            >
              Bingo League Season 4 (September 7 - November 22, 2026)
            </a>
          </List.Item>
          <List.Item>
            <a
              href="https://docs.google.com/spreadsheets/d/1ptNQfJw39CCtHBrGldZ8ln0OrTUUSjAw8QVQHQI1LBU/edit?gid=521253915#gid=521253915"
              target="_blank"
            >
              Bingo League Season 3 (March 2 - May 17, 2026)
            </a>
          </List.Item>
          <List.Item>
            <a
              href="https://docs.google.com/spreadsheets/d/1FwNEMlF1KPdVADiPP539y2a2mDiyHpmoQclALHK9nCA/edit?gid=521253915#gid=521253915"
              target="_blank"
            >
              Bingo League Season 2 (September 8 - November 23, 2025).
            </a>
          </List.Item>
          <List.Item>
            <a
              href="https://docs.google.com/spreadsheets/d/1aYcmIA1KoviLQvQHDNTfzkIyG_BwHrO1cTtgimZtWZw/edit?gid=521253915#gid=521253915"
              target="_blank"
            >
              Bingo League Season 1 (February 1 - May 4, 2025)
            </a>
          </List.Item>
        </List>
        <p>Guides</p>
        <List>
          <List.Item>
            <a href="/rules" target="_blank">
              The UFO 50 Bingo Doc
            </a>
            , including:
            <List>
              <List.Item>Rules</List.Item>
              <List.Item>
                Details about what is counted specific goals, such as bosses and
                levels
              </List.Item>
              <List.Item>Pause & mismark procedures</List.Item>
              <List.Item>Goal changelog</List.Item>
            </List>
          </List.Item>
          <List.Item>
            <a href="/doc" target="_blank">
              Community-maintained resource doc with guides for nearly every
              game
            </a>
          </List.Item>
          <List.Item>
            <a
              href="https://docs.google.com/document/d/1iGmlFIqfsjOsWMqG6GcIiBaOujKH7kmeq8HTZ8gisO8/edit?tab=t.0"
              target="_blank"
            >
              Stats and VOD links for every goal from every match
            </a>
          </List.Item>
          <List.Item>
            <a
              href="https://docs.google.com/spreadsheets/d/1f-otPvnoyOmEIgh-otvszsjbK4KXd0dz2lmnSASyJLo/edit?gid=0#gid=0"
              target="_blank"
            >
              Videos and times of optimal strategies for every goal (WIP)
            </a>
          </List.Item>
        </List>
        <p>Shortcuts</p>
        <List>
          <List.Item>
            <a href="/doc" target="_blank">
              ufo50.bingo/doc
            </a>{" "}
            - The community resource doc. You can also append any game name or
            abbreviation to get a direct link to the appropriate tab. For
            example:
            <List>
              <List.Item>
                <a href="/doc/m2" target="_blank">
                  ufo50.bingo/doc/m2
                </a>{" "}
                - Mortol II
              </List.Item>
              <List.Item>
                <a href="/doc/mini" target="_blank">
                  ufo50.bingo/doc/mini
                </a>{" "}
                - Mini & Max
              </List.Item>
              <List.Item>
                <a href="/doc/od" target="_blank">
                  ufo50.bingo/doc/od
                </a>{" "}
                - Onion Delivery
              </List.Item>
              <List.Item>
                <a href="/doc/rockon" target="_blank">
                  ufo50.bingo/doc/rockon
                </a>{" "}
                - Rock On! Island
              </List.Item>
            </List>
          </List.Item>
          <List.Item>
            <a href="/rules" target="_blank">
              ufo50.bingo/rules
            </a>{" "}
            - The UFO 50 Bingo Doc
          </List.Item>
          <List.Item>
            <a href="/league" target="_blank">
              ufo50.bingo/league
            </a>{" "}
            - The most recent league sheet
          </List.Item>
          <List.Item>
            <a href="/bosses" target="_blank">
              ufo50.bingo/bosses
            </a>{" "}
            - List of valid bosses
          </List.Item>
          <List.Item>
            <a href="/levels" target="_blank">
              ufo50.bingo/levels
            </a>{" "}
            - List of valid levels
          </List.Item>
          <List.Item>
            <a href="/stats" target="_blank">
              ufo50.bingo/stats
            </a>{" "}
            - Stats and VOD links
          </List.Item>
        </List>
        <p>Deprecated Community Tools</p>
        <List>
          <List.Item>
            <a
              href="https://gretgor.itch.io/ufo50-bingo-training-dummy"
              target="_blank"
            >
              Bingo “training dummy” by Gretgor.
            </a>{" "}
            Play vs a CPU that also tries to complete goals on a board
          </List.Item>
          <List.Item>
            <a href="https://morzis.itch.io/bingo-pasta-maker" target="_blank">
              Bingo Pasta Maker by Morzis.
            </a>{" "}
            Can be used with completely custom pastas, unlike the tools on this
            site.
          </List.Item>
        </List>
      </Card>
    </Container>
  );
}
