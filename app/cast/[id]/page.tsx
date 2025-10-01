import {
    fetchBoard,
    fetchFeed,
    getSessionCookie,
    getSocketKey,
} from "@/app/fetchMatchInfo";
import { getBoard } from "@/app/matches/parseBingosyncData";
import Cast from "./Cast";

export default async function CastPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const cookie = await getSessionCookie(id);
    const [rawBoard, rawFeed, socketKey] = await Promise.all([
        fetchBoard(id),
        fetchFeed(id, cookie),
        getSocketKey(id, cookie),
    ]);
    const board = getBoard(rawBoard);
    return <Cast id={id} board={board} rawFeed={rawFeed} socketKey={socketKey} />;
}
