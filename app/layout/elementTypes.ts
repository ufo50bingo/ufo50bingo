export interface BaseElement {
  id: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
}

interface HasColor {
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

interface CanShrinkFont extends HasFontWithSize {
  canShrink: boolean;
  minSize: number;
}

// -------------------- FINAL ELEMENTS ------------------

export interface PlainText extends CanShrinkFont {
  text: string;
}

export interface RecentGame extends Element, HasFont {
  type: "recent_game";
  playerNum: number;
  recentGameIndex: number;
  hasDefaultTimer: boolean;
}

export interface RecentGameTimer extends Element, CanShrinkFont, HasColor {
  type: "recent_game_timer";
  playerNum: number;
  recentGameIndex: number;
}

export interface LayoutBoard extends Element, CanShrinkFont, HasColor {
  type: "board";
}

export interface MatchTimer extends Element, CanShrinkFont, HasColor {
  type: "match_timer";
  showStart: boolean;
}

export interface GeneralIcon extends Element, HasFont {
  type: "general_icon";
  playerNum: number;
  generalIndex: number;
  hasInsetCount: boolean;
  iconSet: string;
}

export interface GeneralCount extends Element, CanShrinkFont, HasColor {
  type: "general_count";
  playerNum: number;
  generalIndex: number;
}

export interface PlayerScore extends Element, CanShrinkFont, HasColor {
  type: "player_score";
  playerNum: number;
  hasDefaultBackground: boolean;
  showTiebreaker: boolean;
}

export interface PlayerPronouns extends Element, CanShrinkFont, HasColor {
  type: "player_pronouns";
  playerNum: number;
}

export interface PlayerName extends Element, CanShrinkFont, HasColor {
  type: "player_name";
  playerNum: number;
  allowCustomName: boolean;
}

export type LayoutElement =
  | RecentGame
  | RecentGameTimer
  | MatchTimer
  | LayoutBoard
  | PlayerScore
  | GeneralIcon
  | GeneralCount
  | PlayerPronouns
  | PlainText;
