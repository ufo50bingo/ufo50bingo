import JoinMatch from "./JoinMatch";
import PlayPage from "./play/PlayPage";
import {
  FeedDisconnect,
  FeedMember,
  fetchDisconnectSql,
  fetchMemberSql,
  NewFeedItem,
  parseDisconnectResult,
  parseMemberResult,
} from "@/app/fetchFeed";
import getSql from "@/app/getSql";
import Login from "./Login";
import getSession from "@/app/getSession";
import { cookies } from "next/headers";
import CastPage from "./cast/CastPage";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id: gameIdStr }, session] = await Promise.all([
    params,
    getSession(),
  ]);
  const gameId = Number(gameIdStr);
  if (session == null) {
    return <Login gameId={gameId} session={null} />;
  }
  if (session.user.isAnonymous) {
    const cookieStore = await cookies();
    const isConfirmed =
      cookieStore.get(`anonymous-confirmed-${gameId}`)?.value === "true";
    if (!isConfirmed) {
      return <Login gameId={gameId} session={session} />;
    }
  }
  const userId = Number(session.user.id);
  const sql = getSql(false);
  const memberResult = await sql.transaction([
    fetchMemberSql(sql, gameId),
    fetchDisconnectSql(sql, gameId),
  ]);
  const memberFeed = parseMemberResult(memberResult[0]);
  const disconnectFeed = parseDisconnectResult(memberResult[1]);
  const lastMember: null | undefined | FeedMember = memberFeed
    .filter((member) => member.userId === userId)
    .toSorted((a, b) => b.time - a.time)[0];
  const lastDisconnect: null | undefined | FeedDisconnect = disconnectFeed
    .filter((dc) => dc.userId === userId)
    .toSorted((a, b) => b.time - a.time)[0];
  const userMember =
    lastDisconnect != null &&
    lastMember != null &&
    lastDisconnect.time > lastMember.time
      ? null
      : (lastMember ?? null);
  if (userMember == null || userMember.isInvite) {
    return (
      <JoinMatch
        gameId={gameId}
        userId={userId}
        userMember={userMember ?? null}
      />
    );
  }

  const alreadyFetched: ReadonlyArray<NewFeedItem> = [
    ...memberFeed,
    ...disconnectFeed,
  ];

  if (lastMember.playerColor == null) {
    return (
      <CastPage
        gameId={gameId}
        userId={userId}
        alreadyFetched={alreadyFetched}
      />
    );
  } else {
    return (
      <PlayPage
        gameId={gameId}
        userId={userId}
        alreadyFetched={alreadyFetched}
      />
    );
  }
}
