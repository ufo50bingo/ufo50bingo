import type { Widget } from "./widgetTypes";

export type WidgetType = Widget["type"];

export const WIDGET_TYPES: ReadonlyArray<WidgetType> = [
  "board",
  "plain_text",
  "player_name",
  "player_pronouns",
  "player_score",
  "match_timer",
  "general_icon",
  "general_count",
  "recent_game",
  "recent_game_timer",
];

export function getWidgetLabel(type: WidgetType): string {
  switch (type) {
    case "recent_game":
      return "Recent Game";
    case "recent_game_timer":
      return "Recent Game Timer";
    case "match_timer":
      return "Match Timer";
    case "board":
      return "Board";
    case "player_score":
      return "Player Score";
    case "general_icon":
      return "General Icon";
    case "general_count":
      return "General Count";
    case "player_pronouns":
      return "Player Pronouns";
    case "player_name":
      return "Player Name";
    case "plain_text":
      return "Plain Text";
  }
}

export function isAspectRatioLocked(type: WidgetType): boolean {
  switch (type) {
    case "recent_game":
    case "general_icon":
      return true;
    case "recent_game_timer":
    case "match_timer":
    case "board":
    case "player_score":
    case "general_count":
    case "player_pronouns":
    case "player_name":
    case "plain_text":
      return false;
  }
}

const FONT = { font: "sans-serif" };
const TEXT = { ...FONT, defaultSize: 24, canShrink: true, minSize: 8 };
const PLAYER_COLOR = {
  color: { type: "player_color", playerNum: 1 } as const,
};
const WHITE = { type: "custom_color", color: "#ffffffff" } as const;

export function createWidget(type: WidgetType, id: string, z: number): Widget {
  const base = { id, x: 0, y: 0, z, width: 200, height: 50 };
  switch (type) {
    case "board":
      return {
        type,
        ...base,
        ...TEXT,
        color: WHITE,
        width: 525,
        height: 475,
        squarePadding: 5,
        borderWidth: 1,
        borderColor: "#424242",
        blankSquareColor: "#181818",
      };
    case "plain_text":
      return { type, ...base, ...TEXT, text: "Content" };
    case "player_name":
      return {
        type,
        ...base,
        ...TEXT,
        ...PLAYER_COLOR,
        playerNum: 1,
        allowCustomName: true,
      };
    case "player_pronouns":
      return { type, ...base, ...TEXT, ...PLAYER_COLOR, playerNum: 1 };
    case "player_score":
      return {
        type,
        ...base,
        ...TEXT,
        ...PLAYER_COLOR,
        playerNum: 1,
        hasDefaultBackground: true,
        showTiebreaker: false,
      };
    case "match_timer":
      return { type, ...base, ...TEXT, ...PLAYER_COLOR, showStart: true };
    case "general_icon":
      return {
        type,
        ...base,
        ...FONT,
        width: 62,
        height: 62,
        playerNum: 1,
        generalNumber: 1,
        hasInsetCount: true,
        iconSet: "WinnerBit",
      };
    case "general_count":
      return {
        type,
        ...base,
        ...TEXT,
        ...PLAYER_COLOR,
        playerNum: 1,
        generalNumber: 1,
      };
    case "recent_game":
      return {
        type,
        ...base,
        ...FONT,
        width: 60,
        height: 68,
        playerNum: 1,
        recentGameNumber: 1,
        hasDefaultTimer: true,
      };
    case "recent_game_timer":
      return {
        type,
        ...base,
        ...TEXT,
        ...PLAYER_COLOR,
        playerNum: 1,
        recentGameNumber: 1,
      };
  }
}
