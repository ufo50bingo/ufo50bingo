import { ReactNode } from "react";
import { UFOPasta } from "../generator/ufoGenerator";
import { STANDARD_UFO } from "./standardUfo";
import { SPICY_UFO } from "./spicyUfo";
import { BLITZ_UFO } from "./blitzUfo";
import { CHOCO_UFO } from "./chocoUfo";
import { CAMPANELLA3_UFO } from "./campanella3Ufo";
import { CLARITY_UFO } from "./clarityUfo";
import { NOZZLO_UFO } from "./nozzloUfo";
import { PROTOTYPE_UFO } from "./prototypeUfo";
import { SEASON_1_UFO } from "./season1Ufo";
import { SEASON_2_UFO } from "./season2Ufo";
import { COMBO_UFO } from "./comboUfo";
import { GAME_NAMES_UFO } from "./gameNamesUfo";
import { CHERRY_RACE_UFO } from "./cherryRaceUfo";
import { NES_50_UFO } from "./nes50Ufo";

const RAW_METADATA = [
  {
    type: "UFO",
    name: "Standard",
    pasta: STANDARD_UFO,
    info: (
      <span>
        The default goal set for bingo, and the one used in League play.{" "}
        <a
          target="_blank"
          href="https://docs.google.com/document/d/11kIVxD6NOsoXXXdv22owLPM_nj5oKiCpY53K418muW8/edit?tab=t.0#heading=h.us0d6jom1jp"
        >
          View the full rules here.
        </a>
      </span>
    ),
  },
  {
    type: "UFO",
    name: "Spicy",
    pasta: SPICY_UFO,
    info: (
      <span>
        A more challenging goal set, often played 2v2.{" "}
        <a
          target="_blank"
          href="https://docs.google.com/document/d/1Snf0qAm68dRROjoh8hb3Rn0OV-THyD2PcLJeuN-209U/edit?tab=t.0#heading=h.mkzjcutr4nw7"
        >
          Also has restrictions which players are expected to follow at all
          times.
        </a>{" "}
        Recommended 90 second review period instead of the standard 60 seconds.
      </span>
    ),
  },
  {
    type: "UFO",
    name: "Combo",
    pasta: COMBO_UFO,
    info: <span>A goal set that combines Standard and Spicy goals.</span>,
  },
  {
    type: "UFO",
    name: "Blitz",
    pasta: BLITZ_UFO,
    info: (
      <span>
        A faster, generally easier variant. Recommended to have no board review
        time instead of the standard 60 seconds.
      </span>
    ),
  },
  {
    type: "Custom",
    name: "Custom",
  },
  {
    type: "UFO",
    name: "NES 50",
    pasta: NES_50_UFO,
    info: (
      <span>
        A new bingo goal set using 50 classic NES games!
        <br />
        Read the{" "}
        <a
          href="https://docs.google.com/spreadsheets/d/1ItphMvsXO4ev3NR1YMrs-x3eTEIxYBJF/edit?gid=1685175412#gid=1685175412"
          target="_blank"
        >
          official setup instructions and rules
        </a>{" "}
        here.
        <br />
        Join{" "}
        <a href="https://discord.gg/R75MwqfJ5s" target="_blank">
          the Discord server
        </a>{" "}
        and reach out to Aha to get started!
      </span>
    ),
  },
  {
    type: "UFO",
    name: "Choco",
    pasta: CHOCO_UFO,
    info: (
      <span>
        Similar to Blitz, but games are even faster. Recommended to have no
        board review time instead of the standard 60 seconds.
      </span>
    ),
  },
  {
    type: "UFO",
    name: "10 Cherry Race",
    pasta: CHERRY_RACE_UFO,
    info: (
      <span>
        Create a board for drafting games in a 10 cherry race.
        <br />
        <a
          href="https://docs.google.com/document/d/1g3XyARTXyPh64fX4wk41yergDv7YsuZEkYKZeZnTB4g/edit?tab=t.0"
          target="_blank"
        >
          See the official drafting rules here.
        </a>
      </span>
    ),
  },
  {
    type: "UFO",
    name: "Game Names",
    pasta: GAME_NAMES_UFO,
    info: (
      <span>
        Create a board containing only names of games. Useful if you want to
        race for Gifts, Gold Disks, or Cherry Disks across the collection.
      </span>
    ),
  },
  {
    type: "UFO",
    name: "Prototype",
    pasta: PROTOTYPE_UFO,
    info: (
      <span>
        The goal set used for{" "}
        <a
          target="blank"
          href="https://www.youtube.com/watch?v=AVvqYWGPX8U&list=PLknPYaq85B6TPX6Pkkm52EuG5OpRCZe8R"
        >
          the very first tournament!
        </a>{" "}
        See how it all started!
      </span>
    ),
  },
  {
    type: "UFO",
    name: "Season 1",
    pasta: SEASON_1_UFO,
    info: (
      <span>
        The goal set used for{" "}
        <a
          target="blank"
          href="https://docs.google.com/spreadsheets/d/1aYcmIA1KoviLQvQHDNTfzkIyG_BwHrO1cTtgimZtWZw/edit?gid=521253915#gid=521253915"
        >
          Season 1 of Bingo League.
        </a>
      </span>
    ),
  },
  {
    type: "UFO",
    name: "Season 2",
    pasta: SEASON_2_UFO,
    info: (
      <span>
        The goal set used for{" "}
        <a
          target="blank"
          href="https://docs.google.com/spreadsheets/d/1FwNEMlF1KPdVADiPP539y2a2mDiyHpmoQclALHK9nCA/edit?gid=521253915#gid=521253915"
        >
          Season 2 of Bingo League.
        </a>
      </span>
    ),
  },
  {
    type: "UFO",
    name: "Nozzlo (Deprecated)",
    pasta: NOZZLO_UFO,
    info: (
      <span>
        An absurdly difficult variant with very long, deliberately
        unbalanced/unfair goals. Nozzlo is usually played as a cooperative "raid
        boss" event approximately once every quarter.
        <br />
        Nozzlo community events use a newer goal set which is{" "}
        <strong>intentionally non-public</strong>. This variant uses the
        original, unbalanced goal set.
        <br />
        <a
          target="_blank"
          href="https://docs.google.com/document/d/1CLCDLDH4F0ufhGAcnDuKTtcZISrfwBonuPnbTQldh4Y/edit?tab=t.0"
        >
          View the official rules here.
        </a>
      </span>
    ),
  },
  {
    type: "UFO",
    name: "Campanella 3",
    pasta: CAMPANELLA3_UFO,
    info: (
      <span>
        A goal set using the “secret” minigames in Campanella 3. Access
        minigames by holding button 2 on the P2 controller during regular
        gameplay.
      </span>
    ),
  },
  {
    type: "UFO",
    name: "Clarity",
    pasta: CLARITY_UFO,
    info: (
      <span>
        This goal set’s obtuse and wordy nature is a nod to an infamous bingo
        goal of the past.
      </span>
    ),
  },
] as const;

export const SELECTOR_DATA = [
  { group: "Main", items: ["Standard", "Spicy", "Blitz", "Combo", "Custom"] },
  {
    group: "Other",
    items: [
      "10 Cherry Race",
      "NES 50",
      "Choco",
      "Game Names",
      "Nozzlo (Deprecated)",
      "Campanella 3",
      "Clarity",
    ],
  },
  { group: "Past versions", items: ["Prototype", "Season 1", "Season 2"] },
];

export type Variant = (typeof RAW_METADATA)[number]["name"];

interface MetadataBase {
  name: Variant;
  info?: ReactNode;
}

interface Custom extends MetadataBase {
  type: "Custom";
}

interface UFO extends MetadataBase {
  type: "UFO";
  pasta: UFOPasta;
}

export type VariantMetadata = Custom | UFO;

export const METADATA: ReadonlyArray<VariantMetadata> = RAW_METADATA;
