import {
    fetchBoard,
    fetchFeed,
    getSocketKey,
} from "@/app/fetchMatchInfo";
import { getBoard } from "@/app/matches/parseBingosyncData";
import Cast from "./Cast";
import Login from "./Login";
import getCookie from "./getCookie";

type FilterParams = {
    use_bot: string;
};

export default async function CastPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams?: Promise<FilterParams>;
}) {
    const useBot = (await searchParams)?.use_bot;
    const { id } = await params;

    const cookie = await getCookie(id, useBot === 'true');
    if (cookie == null) {
        return <Login />;
    }
    const [rawBoard, rawFeed, socketKey] = await Promise.all([
        fetchBoard(id),
        fetchFeed(id, cookie),
        getSocketKey(id, cookie),
    ]);
    const board = getBoard(rawBoard);
    return (
        <Cast
            id={id}
            board={board}
            rawFeed={rawFeed}
            socketKey={socketKey}
        />
    );
}
