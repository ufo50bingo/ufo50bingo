"use client";

import { BingosyncColor } from "./parseBingosyncData";
import { LeagueInfo } from "../createboard/createMatch";
import { RoomBackend } from "../roomApi";

interface Player {
  name: string;
  color: BingosyncColor;
  score: number;
}

type Vod = {
  url: string;
  startSeconds: null | number;
};

export interface Match {
  id: string;
  name: string;
  dateCreated: number;
  variant: string;
  isCustom: boolean;
  isDraft: boolean;
  winner: null | Player;
  opponent: null | Player;
  hasBingo: null | boolean;
  boardJson: null | string;
  changelogJson: null | string;
  isBoardVisible: boolean;
  vod: null | Vod;
  analysisSeconds: number;
  leagueInfo: null | LeagueInfo;
  creatorID: null | string;
  roomBackend: RoomBackend;
}

const MS_IN_DAY = 1000 * 60 * 60 * 24;

export function isTooOld(dateCreated: number): boolean {
  return Date.now() - dateCreated * 1000 > MS_IN_DAY;
}
