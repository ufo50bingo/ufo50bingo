"use client";

import { Button, Card, Container, Stack, Text, TextInput, Title } from "@mantine/core";
import { useParams, usePathname } from "next/navigation";
import createSession from "./createSession";
import { useState } from "react";

export default function Login() {
    const pathname = usePathname();
    const { id } = useParams<{ id: string }>();

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    return (<Container>
        <Card
            shadow="sm"
            padding="sm"
            radius="md"
            withBorder={true}
        >
            <Card.Section inheritPadding={true} py="sm" withBorder={true}><Stack><Title order={1}>Spectate Match</Title><Text size="sm">You can use this page to spectate an in-progress match.</Text></Stack></Card.Section>
            <Card.Section inheritPadding={true} py="sm" withBorder={true}>
                <Stack>
                    <Text size="sm"><strong>If you do not have the bingosync password</strong>, you can access a read-only view, where chatting and admin features are disabled.</Text>
                    <Button component="a" href={`${pathname}?use_bot=true`}>Access read-only view</Button>
                </Stack>
            </Card.Section>
            <Card.Section inheritPadding={true} py="sm" withBorder={true}>
                <Stack>
                    <Text size="sm"><strong>If you have the bingosync password</strong>, you can access the full view, where you can chat and use admin features.</Text>
                    <TextInput label="Nickname" value={name} onChange={event => setName(event.target.value)} />
                    <TextInput label="Password" value={password} onChange={event => setPassword(event.target.value)} />
                    <Button onClick={async () => await createSession(id, name, password)}>Access admin view</Button>
                </Stack>
            </Card.Section>
        </Card>
    </Container>);
}