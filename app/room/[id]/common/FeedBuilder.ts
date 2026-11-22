import { BingosyncColor } from "@/app/color";
import { NewFeed, NewFeedItem } from "@/app/fetchFeed";
import BoardState, { BoardStateParams } from "@/app/match/[id]/BoardState";
import { GenericMember } from "./useMembers";

interface BaseDisplayedFeedItem {
  time: number;
  userId: number;
  userColor: null | BingosyncColor;
}
interface DisplayedChat extends BaseDisplayedFeedItem {
  type: "chat";
  message: string;
  visibleToPlayerIds: null | ReadonlyArray<number>;
}
interface DisplayedMark extends BaseDisplayedFeedItem {
  type: "mark";
  squareName: string;
  squareColor: BingosyncColor;
  isClear: boolean;
}
interface DisplayedFailedMark extends BaseDisplayedFeedItem {
  type: "failed_mark";
  squareName: string;
  squareColor: BingosyncColor;
}
interface DisplayedJoin extends BaseDisplayedFeedItem {
  type: "join";
}
interface DisplayedRoleChange extends BaseDisplayedFeedItem {
  type: "role_change";
  newColor: null | BingosyncColor;
}
interface DisplayedDisconnect extends BaseDisplayedFeedItem {
  type: "disconnect";
}
interface DisplayedColorChange extends BaseDisplayedFeedItem {
  type: "color_change";
  newColor: BingosyncColor;
}
interface DisplayedSetDuration extends BaseDisplayedFeedItem {
  type: "set_duration";
  duration: number;
}
interface DisplayedPause extends BaseDisplayedFeedItem {
  type: "pause";
}
interface DisplayedStart extends BaseDisplayedFeedItem {
  type: "start";
}

export type DisplayedFeedItem =
  | DisplayedChat
  | DisplayedMark
  | DisplayedFailedMark
  | DisplayedJoin
  | DisplayedRoleChange
  | DisplayedDisconnect
  | DisplayedColorChange
  | DisplayedSetDuration
  | DisplayedPause
  | DisplayedStart;

export default class FeedBuilder {
  boardState: BoardState;
  squareNames: ReadonlyArray<string>;
  allMembers: Map<number, GenericMember>;
  displayedFeed: Array<DisplayedFeedItem>;
  disconnected: Set<number>;

  constructor(
    boardStateParams: BoardStateParams,
    squareNames: ReadonlyArray<string>,
  ) {
    this.boardState = new BoardState(boardStateParams);
    this.squareNames = squareNames;
    this.allMembers = new Map();
    this.displayedFeed = [];
    this.disconnected = new Set();
  }

  static getDisplayedFeed(
    boardStateParams: BoardStateParams,
    squareNames: ReadonlyArray<string>,
    feed: NewFeed,
  ): ReadonlyArray<DisplayedFeedItem> {
    const builder = new FeedBuilder(boardStateParams, squareNames);
    for (const feedItem of feed) {
      builder.apply(feedItem);
    }
    return builder.displayedFeed;
  }

  apply(item: NewFeedItem): void {
    switch (item.type) {
      case "color_mark": {
        const wasSuccessful = this.boardState.apply(item);
        if (wasSuccessful) {
          const newItem: DisplayedMark = {
            type: "mark",
            time: item.time,
            userId: item.userId,
            userColor: this.getCurrentUserColor(item.userId),
            squareColor: item.color,
            isClear: item.isClear,
            squareName: this.squareNames[item.squareIndex],
          };
          this.displayedFeed.push(newItem);
        } else {
          // this was an unsuccessful mark
          if (
            this.boardState.isLockout &&
            !item.isClear &&
            !this.boardState.hasColor(item.squareIndex, item.color)
          ) {
            const newItem: DisplayedFailedMark = {
              type: "failed_mark",
              time: item.time,
              userId: item.userId,
              userColor: this.getCurrentUserColor(item.userId),
              squareColor: item.color,
              squareName: this.squareNames[item.squareIndex],
            };
            this.displayedFeed.push(newItem);
          }
        }
        break;
      }
      case "chat": {
        const newItem: DisplayedChat = {
          type: "chat",
          time: item.time,
          userId: item.userId,
          userColor: this.getCurrentUserColor(item.userId),
          message: item.message,
          visibleToPlayerIds: item.visibleToPlayers,
        };
        this.displayedFeed.push(newItem);
        break;
      }
      case "timer_event": {
        switch (item.event) {
          case "set_duration": {
            const newItem: DisplayedSetDuration = {
              type: "set_duration",
              time: item.time,
              userId: item.userId,
              userColor: this.getCurrentUserColor(item.userId),
              duration: item.duration ?? 0,
            };
            this.displayedFeed.push(newItem);
            break;
          }
          case "pause": {
            const newItem: DisplayedPause = {
              type: "pause",
              time: item.time,
              userId: item.userId,
              userColor: this.getCurrentUserColor(item.userId),
            };
            this.displayedFeed.push(newItem);
            break;
          }
          case "start": {
            const newItem: DisplayedStart = {
              type: "start",
              time: item.time,
              userId: item.userId,
              userColor: this.getCurrentUserColor(item.userId),
            };
            this.displayedFeed.push(newItem);
            break;
          }
        }
        break;
      }
      case "member": {
        const existing = this.allMembers.get(item.userId);
        this.allMembers.set(item.userId, {
          userId: item.userId,
          name: item.name,
          overrideName: item.overrideName,
          color: item.playerColor,
          isInvite: item.isInvite,
          initialTime: existing?.initialTime ?? item.time,
          image: item.image,
        });
        if (existing == null || this.disconnected.has(item.userId)) {
          this.disconnected.delete(item.userId);
          const newItem: DisplayedJoin = {
            type: "join",
            userId: item.userId,
            userColor: item.playerColor,
            time: item.time,
          };
          this.displayedFeed.push(newItem);
        } else if (
          (existing.color == null && item.playerColor != null) ||
          (existing.color != null && item.playerColor == null)
        ) {
          const newItem: DisplayedRoleChange = {
            type: "role_change",
            userId: item.userId,
            userColor: existing.color,
            time: item.time,
            newColor: item.playerColor,
          };
          this.displayedFeed.push(newItem);
        }
        break;
      }
      case "player_color_change": {
        const newItem: DisplayedColorChange = {
          type: "color_change",
          time: item.time,
          userId: item.userId,
          userColor: this.getCurrentUserColor(item.userId),
          newColor: item.playerColor,
        };
        const existing = this.allMembers.get(item.userId);
        if (existing != null && existing.color != null) {
          this.allMembers.set(item.userId, {
            ...existing,
            color: item.playerColor,
          });
        }
        this.displayedFeed.push(newItem);
        break;
      }
      case "disconnect": {
        this.disconnected.add(item.userId);
        const newItem: DisplayedDisconnect = {
          type: "disconnect",
          userId: item.userId,
          time: item.time,
          userColor: this.getCurrentUserColor(item.userId),
        };
        this.displayedFeed.push(newItem);
        break;
      }
      case "goal_progress": {
        break;
      }
      case "current_subcategory": {
        break;
      }
      case "player_order": {
        break;
      }
    }
  }

  getCurrentUserColor(userId: number): null | BingosyncColor {
    return this.allMembers.get(userId)?.color ?? null;
  }
}
