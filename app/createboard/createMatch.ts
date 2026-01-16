"use server";

import getCsrfData from "../getCsrfData";
import { insertMatch } from "./insertMatch";
import { Variant } from "../pastas/metadata";
import {
  createUserID,
  readSession,
  writeSession,
} from "../session/sessionUtil";

const BINGOSYNC_BASE_URL = "https://www.bingosync.com/";

export interface LeagueInfo {
  season: number;
  tier: string;
  week: string;
  game: number | null;
  p1: string;
  p2: string;
}

export interface CommonMatchProps {
  roomName: string;
  password: string;
  leagueInfo: LeagueInfo | null;
  isPublic: boolean;
  variant: Variant;
  isCustom: boolean;
  isLockout: boolean;
}

interface Props extends CommonMatchProps {
  pasta: string;
  bingosyncVariant: string;
}

export default async function createMatch({
  roomName,
  password,
  isPublic,
  variant,
  bingosyncVariant,
  isCustom,
  isLockout,
  pasta,
  leagueInfo,
}: Props): Promise<string> {
  const [{ cookie, token }, userSessionRead] = await Promise.all([
    getCsrfData(),
    readSession(),
  ]);

  const userSession = userSessionRead ?? { id: createUserID(), admin: false };

  const createResponse = await fetch(BINGOSYNC_BASE_URL, {
    method: "POST",
    redirect: "manual",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookie,
    },
    body: new URLSearchParams({
      csrfmiddlewaretoken: token,
      room_name: roomName,
      passphrase: password,
      nickname: "ufo50bingobot",
      game_type: "18",
      // TODO: Pass variant_type in from the front end
      variant_type: bingosyncVariant,
      custom_json: pasta,
      lockout_mode: isLockout ? "2" : "1",
      seed: Math.ceil(999999 * Math.random()).toString(),
      is_spectator: "on",
      hide_card: "on",
    }).toString(),
  });

  if (createResponse.status !== 302) {
    throw new Error(
      `Bingosync failed to redirect to room page with status ${createResponse.status}`
    );
  }

  const location = createResponse.headers.get("location");
  if (!location?.startsWith("/room/")) {
    throw new Error(`Bingosync redirected to ${location}. Expected /room/<id>`);
  }
  // strip off /room/ prefix
  const id = location.slice(6);

  const sessionCookie = createResponse.headers.get("Set-Cookie");
  if (sessionCookie == null) {
    throw new Error(`Failed to fetch session cookie for id ${id}`);
  }

  await writeSession(userSession);

  // add room to table for tracking
  // shouldn't need the `await` here, but nextjs complains
  // if you revalidate while rendering
  await insertMatch({
    id,
    roomName,
    password,
    isPublic,
    variant,
    isCustom,
    isLockout,
    leagueInfo,
    cookie: sessionCookie,
    creatorID: userSession.id,
  });

  return id;
}
