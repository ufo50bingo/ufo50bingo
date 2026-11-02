"use server";

import {
  FeedChat,
  FeedColorMark,
  FeedCurrentSubcategory,
  FeedGoalProgress,
  FeedMember,
  FeedPlayerOrder,
  FeedTimerEvent,
  NewFeedItem,
  SQLTemplate,
} from "@/app/fetchFeed";
import getSql from "@/app/getSql";
import { SQL } from "@/app/matches/page";
import { env } from "process";

export default async function persistEvent(
  gameId: number,
  token: string,
  event: NewFeedItem,
): Promise<void> {
  const isValidated = await validateToken(gameId, token);
  if (!isValidated) {
    throw new Error("Failed to validate token! Try refreshing your page");
  }
  const sql = getSql(false);
  switch (event.type) {
    case "color_mark":
      await getColorMarkSql(sql, gameId, event);
      break;
    case "chat":
      await getChatSql(sql, gameId, event);
      break;
    case "timer_event":
      await getTimerEventSql(sql, gameId, event);
      break;
    case "member":
      await getMemberSql(sql, gameId, event);
      break;
    case "goal_progress":
      await getGoalProgressSql(sql, gameId, event);
      break;
    case "current_subcategory":
      await getCurrentSubcategorySql(sql, gameId, event);
      break;
    case "player_order":
      await getPlayerOrderSql(sql, gameId, event);
      break;
    default:
      throw new Error(`Unexpected event: ${JSON.stringify(event)}`);
  }
}

function getISO(timeInSeconds: number): string {
  return new Date(timeInSeconds * 1000).toISOString();
}

function getColorMarkSql(
  sql: SQLTemplate,
  gameId: number,
  event: FeedColorMark,
): SQL {
  return sql`
    INSERT INTO color_mark (
      game_id,
      time,
      user_id,
      square_index,
      color,
      is_clear
    )
    VALUES (
      ${gameId},
      ${getISO(event.time)},
      ${event.userId},
      ${event.squareIndex},
      ${event.color},
      ${event.isClear}
    )
  `;
}

function getChatSql(sql: SQLTemplate, gameId: number, event: FeedChat): SQL {
  return sql`
    INSERT INTO chat (
      game_id,
      time,
      user_id,
      message,
      visible_to_players
    )
    VALUES (
      ${gameId},
      ${getISO(event.time)},
      ${event.userId},
      ${event.message},
      ${event.visibleToPlayers}
    )
  `;
}

function getTimerEventSql(
  sql: SQLTemplate,
  gameId: number,
  event: FeedTimerEvent,
): SQL {
  return sql`
    INSERT INTO timer_event (
      game_id,
      time,
      user_id,
      event,
      duration
    )
    VALUES (
      ${gameId},
      ${getISO(event.time)},
      ${event.userId},
      ${event.event},
      ${event.duration}
    )
  `;
}

function getMemberSql(
  sql: SQLTemplate,
  gameId: number,
  event: FeedMember,
): SQL {
  return sql`
    INSERT INTO member (
      game_id,
      user_id,
      player_color,
      time,
      is_invite,
      override_name
    )
    VALUES (
      ${gameId},
      ${event.userId},
      ${event.playerColor},
      ${getISO(event.time)},
      FALSE,
      ${event.overrideName}
    )
  `;
}

function getGoalProgressSql(
  sql: SQLTemplate,
  gameId: number,
  event: FeedGoalProgress,
): SQL {
  return sql`
    INSERT INTO goal_progress (
      game_id,
      time,
      user_id,
      goal_id,
      subcategory_id,
      count
    )
    VALUES (
      ${gameId},
      ${getISO(event.time)},
      ${event.userId},
      ${event.goalId},
      ${event.subcategoryId},
      ${event.count}
    )
  `;
}

function getCurrentSubcategorySql(
  sql: SQLTemplate,
  gameId: number,
  event: FeedCurrentSubcategory,
): SQL {
  return sql`
    INSERT INTO current_subcategory (
      game_id,
      time,
      user_id,
      subcategory_id
    )
    VALUES (
      ${gameId},
      ${getISO(event.time)},
      ${event.userId},
      ${event.subcategoryId}
    )
  `;
}

function getPlayerOrderSql(
  sql: SQLTemplate,
  gameId: number,
  event: FeedPlayerOrder,
): SQL {
  return sql`
    INSERT INTO player_order (
      game_id,
      time,
      ordered_ids
    )
    VALUES (
      ${gameId},
      ${getISO(event.time)},
      ${event.orderedIds}
    )
  `;
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function validateToken(gameId: number, token: string): Promise<boolean> {
  const tokenBytes = new Uint8Array(fromBase64Url(token)).buffer;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(env.GAME_AUTH_SECRET),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["verify"],
  );
  return await crypto.subtle.verify(
    "HMAC",
    key,
    tokenBytes,
    encoder.encode(`game:${gameId}`),
  );
}
