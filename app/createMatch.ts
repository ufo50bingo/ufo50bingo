"use server";

import getCsrfData from "./getCsrfData";
import { insertMatch } from "./insertMatch";
import { Variant } from "./pastas/metadata";

const BINGOSYNC_BASE_URL = "https://www.bingosync.com/";

export interface CommonMatchProps {
  roomName: string;
  password: string;
  leagueSeason: number | null;
  isPublic: boolean;
  variant: Variant;
  isCustom: boolean;
  isLockout: boolean;
}

interface Props extends CommonMatchProps {
  pasta: string;
}

export default async function createMatch({
  roomName,
  password,
  isPublic,
  variant,
  isCustom,
  isLockout,
  pasta,
  leagueSeason,
}: Props): Promise<string> {
  const { cookie, token } = await getCsrfData();

  const createResponse = await fetch(BINGOSYNC_BASE_URL, {
    method: "POST",
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
      variant_type: variant === "Game Names" ? "172" : "187",
      custom_json: pasta,
      lockout_mode: isLockout ? "2" : "1",
      seed: "",
      is_spectator: "on",
      hide_card: "on",
    }).toString(),
  });

  const roomURL = createResponse.url;

  if (roomURL === BINGOSYNC_BASE_URL || roomURL === "") {
    throw new Error("Malformed bingosync request");
  }

  // add room to table for tracking
  insertMatch({
    url: roomURL,
    roomName,
    password,
    isPublic,
    variant,
    isCustom,
    isLockout,
    leagueSeason,
  });

  return createResponse.url;
}
