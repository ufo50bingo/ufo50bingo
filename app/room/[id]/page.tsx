import JoinMatch from "./JoinMatch";
import PlayPage from "./play/PlayPage";
import { fetchMemberSql, parseMemberResult } from "@/app/fetchFeed";
import getSql from "@/app/getSql";
import Login from "./Login";
import getSession from "@/app/getSession";
import { cookies } from "next/headers";

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
  const memberResult = await fetchMemberSql(sql, gameId);
  const memberFeed = parseMemberResult(memberResult);
  const userMember = memberFeed.findLast((member) => member.userId === userId);
  if (userMember == null || userMember.isInvite) {
    return (
      <JoinMatch
        gameId={gameId}
        userId={userId}
        userMember={userMember ?? null}
      />
    );
  }

  // switch (roomCookie.view) {
  //   case "cast":
  //     return <CastPage id={id} roomCookie={roomCookie} roomBackend={roomBackend} />;
  //   case "play":
  return <PlayPage gameId={gameId} userId={userId} memberFeed={memberFeed} />;
  // }
}
