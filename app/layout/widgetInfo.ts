import type { Widget } from "./widgetTypes";

type WidgetType = Widget["type"];

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
