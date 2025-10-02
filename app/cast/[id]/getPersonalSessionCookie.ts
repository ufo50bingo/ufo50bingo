import { cookies } from "next/headers";

export default async function getPersonalSessionCookie(): Promise<null | string> {
    const cookieStore = await cookies();
    const sessionIdCookie = cookieStore.get('sessionid');
    if (sessionIdCookie == null) {
        return null;
    }
    return `sessionid=${sessionIdCookie.value}; HttpOnly; Max-Age=1209600; Path=/; SameSite=Lax`;
}