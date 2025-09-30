'use client';

import { Button, Stack, TextInput } from "@mantine/core";
import { useState } from "react";

export default function CastPage() {
    const roomID = 'nGqRDiSeTUqJV65JcISJdw';
    const [session, setSession] = useState('');
    const [socketKey, setSocketKey] = useState('');
    const [socket, setSocket] = useState<null | WebSocket>(null);
    return (
        <Stack>
            <TextInput label="Session Cookie" value={session} onChange={event => setSession(event.target.value)} />
            <TextInput label="Socket Key" value={socketKey} onChange={event => setSocketKey(event.target.value)} />
            <Button onClick={async () => {
                // await getSocketKey(roomID, session);
                const url = 'wss://sockets.bingosync.com/broadcast';
                const newSocket = new WebSocket(url);
                newSocket.onopen = () => newSocket.send(JSON.stringify({ "socket_key": socketKey }));
                newSocket.onmessage = (evt) => {
                    console.log('on message...');
                    const json = JSON.parse(evt.data);
                    console.log(json);
                }
                setSocket(newSocket);
            }}>Connect to Websocket</Button>
        </Stack>
    );
}