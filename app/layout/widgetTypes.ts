export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BaseWidget extends Rect {
  id: string;
  z: number;
}

export interface HasColor {
  color:
    | { type: "player_color"; playerNum: number }
    | { type: "custom_color"; color: string };
}

interface HasFont {
  font: string;
}

interface HasFontWithSize extends HasFont {
  defaultSize: number;
}

export interface CanShrinkFont extends HasFontWithSize {
  canShrink: boolean;
  minSize: number;
}

// -------------------- FINAL WIDGETS ------------------

export interface PlainText extends BaseWidget, CanShrinkFont {
  type: "plain_text";
  text: string;
}

export interface RecentGame extends BaseWidget, HasFont {
  type: "recent_game";
  playerNum: number;
  recentGameNumber: number;
  hasDefaultTimer: boolean;
}

export interface RecentGameTimer extends BaseWidget, CanShrinkFont, HasColor {
  type: "recent_game_timer";
  playerNum: number;
  recentGameNumber: number;
}

export interface LayoutBoard extends BaseWidget, CanShrinkFont, HasColor {
  type: "board";
  squarePadding: number;
  borderWidth: number;
  borderColor: string;
  blankSquareColor: string;
}

export interface MatchTimer extends BaseWidget, CanShrinkFont, HasColor {
  type: "match_timer";
  showStart: boolean;
}

export interface GeneralIcon extends BaseWidget, HasFont {
  type: "general_icon";
  playerNum: number;
  generalNumber: number;
  hasInsetCount: boolean;
  iconSet: string;
}

export interface GeneralCount extends BaseWidget, CanShrinkFont, HasColor {
  type: "general_count";
  playerNum: number;
  generalNumber: number;
}

export interface PlayerScore extends BaseWidget, CanShrinkFont, HasColor {
  type: "player_score";
  playerNum: number;
  hasDefaultBackground: boolean;
  showTiebreaker: boolean;
}

export interface PlayerPronouns extends BaseWidget, CanShrinkFont, HasColor {
  type: "player_pronouns";
  playerNum: number;
}

export interface PlayerName extends BaseWidget, CanShrinkFont, HasColor {
  type: "player_name";
  playerNum: number;
  allowCustomName: boolean;
}

export type Widget =
  | RecentGame
  | RecentGameTimer
  | MatchTimer
  | LayoutBoard
  | PlayerScore
  | GeneralIcon
  | GeneralCount
  | PlayerPronouns
  | PlayerName
  | PlainText;
