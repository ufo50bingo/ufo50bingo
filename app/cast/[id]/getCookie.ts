import { getSessionCookie } from "@/app/fetchMatchInfo";
import getPersonalSessionCookie from "./getPersonalSessionCookie";

export default async function getCookie(id: string, useBot: boolean): Promise<null | string> {
    if (useBot) {
        return await getSessionCookie(id);
    } else {
        return await getPersonalSessionCookie();
    }
}