"use client";

import { Alert, Card, Container, List, Title } from "@mantine/core";
import LinkWithVariant from "../links/LinkWithVariant";

export default function Resources() {
    return (
        <Container my="md">
            <Card shadow="sm" padding="sm" radius="md" withBorder>
                <Alert variant="light">
                    <LinkWithVariant href="/about">
                        <Title order={5}>
                            If you are new to UFO 50 Bingo, click here first!
                        </Title>
                    </LinkWithVariant>
                </Alert>
                <p>Bingo League</p>
                <List>
                    <List.Item>
                        <a
                            href="https://docs.google.com/spreadsheets/d/1FwNEMlF1KPdVADiPP539y2a2mDiyHpmoQclALHK9nCA/edit?gid=521253915#gid=521253915"
                            target="_blank"
                        >
                            Bingo League Season 2 (September 8 - November 23).
                        </a>
                    </List.Item>
                    <List.Item>
                        <a
                            href="https://docs.google.com/spreadsheets/d/1aYcmIA1KoviLQvQHDNTfzkIyG_BwHrO1cTtgimZtWZw/edit?gid=521253915#gid=521253915"
                            target="_blank"
                        >
                            Bingo League Season 1 (Ended May 4, 2025)
                        </a>
                    </List.Item>
                </List>
                <p>Guides</p>
                <List>
                    <List.Item>
                        <a
                            href="https://docs.google.com/document/d/1RK6UH8mte79lF7yobr9yvkdpMHINBRBRV3hjJVb4MIk/edit?tab=t.0#heading=h.uxdzbgi90akp"
                            target="_blank"
                        >
                            Community-maintained guides for nearly every game
                        </a>
                    </List.Item>
                    <List.Item>
                        <a
                            href="https://docs.google.com/spreadsheets/d/1bW8zjoR2bpr74w-dA4HHt04SqvGg1aj8FJeOs3EqdNE/edit?gid=0#gid=0"
                            target="_blank"
                        >
                            Stats and VOD links for every goal completion from streamed
                            matches
                        </a>
                    </List.Item>
                </List>
                <p>Details</p>
                <List>
                    <List.Item>
                        <a
                            href="https://docs.google.com/document/d/11kIVxD6NOsoXXXdv22owLPM_nj5oKiCpY53K418muW8/edit?usp=sharing"
                            target="_blank"
                        >
                            Standard Rules
                        </a>
                        , including details about what is allowed for completing some goals
                    </List.Item>
                    <List.Item>
                        <a
                            href="https://docs.google.com/document/d/1XyEh20vdf7jtfYW94iIRHmf5YOQ0B-lZ2yh9lJjMMbM/edit?usp=sharing"
                            target="_blank"
                        >
                            Official goal list
                        </a>{" "}
                    </List.Item>
                    <List.Item>
                        For details about Variants, hover over the variant names on the
                        Non-League section of{" "}
                        <LinkWithVariant href="/">Create Match</LinkWithVariant>
                    </List.Item>
                    <p>Community Tools</p>
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
