'use server';

import getCsrfData from "@/app/getCsrfData";
import { cookies } from "next/headers";

const SESSIONID_REGEX = /sessionid=([^;]+);/;

export default async function createSession(id: string, name: string, password: string) {
    const { cookie, token } = await getCsrfData();
    const joinResponse = await fetch(`https://www.bingosync.com/room/${id}`, {
        method: "POST",
        redirect: "manual",
        credentials: "include",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Cookie: cookie,
        },
        body: new URLSearchParams({
            csrfmiddlewaretoken: token,
            encoded_room_uuid: id,
            // these dummy fields are required by the form validation even though they aren't used
            room_name: "dummy",
            creator_name: "dummy",
            game_name: "dummy",
            player_name: name,
            passphrase: password,
            is_spectator: "on",
        }).toString(),
    });

    const sessionCookie = joinResponse.headers.get("Set-Cookie");
    if (sessionCookie == null) {
        throw new Error(`Failed to fetch session cookie for id ${id}`);
    }

    const result = sessionCookie.match(SESSIONID_REGEX);
    if (result == null || result.length < 2) {
        throw new Error(`Failed to find CSRF token in bingosync response`);
    }
    const sessionId = result[1];

    (await cookies()).set('sessionid', sessionId, {
        expires: Date.now() + 2 * 7 * 24 * 60 * 60 * 1000,
        maxAge: 2 * 7 * 24 * 60 * 60,
        httpOnly: true,
        sameSite: 'lax',
        path: `/cast/${id}`
    });
}