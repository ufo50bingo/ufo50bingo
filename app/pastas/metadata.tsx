import { List, Stack, Text } from "@mantine/core";
import { ReactNode } from "react";
import { UFOPasta } from "../generator/ufoGenerator";
import { STANDARD_UFO } from "./standardUfo";
import { SPICY_UFO } from "./spicyUfo";
import { BLITZ_UFO } from "./blitzUfo";
import { CHOCO_UFO } from "./chocoUfo";
import { CAMPANELLA3_UFO } from "./campanella3Ufo";
import { CLARITY_UFO } from "./clarityUfo";
import { NOZZLO_UFO } from "./nozzloUfo";

const RAW_METADATA = [
  {
    type: "UFO",
    name: "Standard",
    pasta: STANDARD_UFO,
    isMenu: false,
    hovercard: (
      <Stack>
        .
        <span>
          This is the default goal set and format for bingo, and the one used in
          Bingo League play.
        </span>
        <a
          target="_blank"
          href="https://docs.google.com/document/d/1XyEh20vdf7jtfYW94iIRHmf5YOQ0B-lZ2yh9lJjMMbM/edit?usp=sharing"
        >
          View the bingo overview document, including full goal list and
          changelog, here.
        </a>
        <a
          target="_blank"
          href="https://docs.google.com/document/d/1VRHljWeJ3lHuN3ou-9R0kMgwoZeCcaEPBsRCI1nWEig/edit?usp=sharing"
        >
          View the full rules here.
        </a>
        <List>
          <List.Item>Balanced goal list and difficulty structure</List.Item>
          <List.Item>
            Accessible to most players familiar with the collection
          </List.Item>
          <List.Item>
            Tested and revised for fairness and goal quality
          </List.Item>
          <List.Item>Overseen by bingo admins</List.Item>
        </List>
      </Stack>
    ),
  },
  {
    type: "UFODraft",
    name: "Standard Draft",
    pasta: STANDARD_UFO,
    isMenu: false,
    hovercard: (
      <Stack>
        <span>
          A new way to play the Standard variant, and the default format for the
          Underground league.
          <br />
          Players draft/ban games, and then a custom board is created where each
          player's picks are represented equally.
        </span>
      </Stack>
    ),
  },
  {
    type: "UFO",
    name: "Spicy",
    pasta: SPICY_UFO,
    isMenu: false,
    hovercard: (
      <Stack>
        <span>
          A more challenging variant. Can be played 1v1, 2v2, and with or
          without instant win conditions. Also has restrictions which do not
          appear directly on Bingo squares.
        </span>
        <a
          target="_blank"
          href="https://docs.google.com/document/d/1Snf0qAm68dRROjoh8hb3Rn0OV-THyD2PcLJeuN-209U/edit?tab=t.0#heading=h.mkzjcutr4nw7"
        >
          View additional restrictions here.
        </a>
        <List>
          <List.Item>
            Longer, more challenging goals, often with more elaborate
            restrictions
          </List.Item>
          <List.Item>
            Higher and more specific requirements in general goals
          </List.Item>
          <List.Item>No collectathon goals</List.Item>
          <List.Item>
            Tailored to players very familiar with the mechanics of most games;
            not for newcomers
          </List.Item>
          <List.Item>
            Goal list is not as balanced with regards to specific difficulty
            assignments or game representation
          </List.Item>
          <List.Item>Different default difficulty tier structure</List.Item>
          <List.Item>90 second review period instead of 60 seconds</List.Item>
        </List>
        <Text size="xs">
          <em>Created by Matt</em>
        </Text>
      </Stack>
    ),
  },
  {
    type: "UFODraft",
    name: "Spicy Draft",
    pasta: SPICY_UFO,
    isMenu: false,
    hovercard: (
      <Stack>
        <span>
          A new way to play the Spicy variant.
          <br />
          Players draft/ban games, and then a custom board is created where each
          player's picks are represented equally.
        </span>
      </Stack>
    ),
  },
  {
    type: "UFO",
    name: "Blitz",
    pasta: BLITZ_UFO,
    isMenu: false,
    hovercard: (
      <Stack>
        <span>A faster, generally easier variant.</span>
        <List>
          <List.Item>Goals are shorter overall</List.Item>
          <List.Item>No review time for the board</List.Item>
          <List.Item>
            No difficulty tiers; all goals are roughly equal in length/challenge
          </List.Item>
        </List>
        <Text size="xs">
          <em>Created by Peter Peladon</em>
        </Text>
      </Stack>
    ),
  },
  {
    type: "UFO",
    name: "Nozzlo",
    pasta: NOZZLO_UFO,
    isMenu: true,
    hovercard: (
      <Stack>
        <span>
          An absurdly difficult variant with very long, deliberately
          unbalanced/unfair goals.
        </span>
        <a
          target="_blank"
          href="https://docs.google.com/document/d/1CLCDLDH4F0ufhGAcnDuKTtcZISrfwBonuPnbTQldh4Y/edit?tab=t.0"
        >
          View the official rules here.
        </a>
        <List>
          <List.Item>Review period optional</List.Item>
          <List.Item>No reviewing the goal list at all in advance</List.Item>
          <List.Item>No time limit</List.Item>
          <List.Item>
            No resources, generally speaking (other players may assist you)
          </List.Item>
          <List.Item>
            No difficulty tiers; all goals roughly equal in length and challenge
          </List.Item>
          <List.Item>
            Can be played as player vs player, but is almost exclusively played
            in “raid boss” mode where a team of players work together to make 3
            bingos on one board
          </List.Item>
        </List>
        <Text size="xs">
          <em>Created by Peter Peladon</em>
        </Text>
      </Stack>
    ),
  },
  {
    type: "GameNames",
    name: "Game Names",
    isMenu: false,
    hovercard: (
      <Stack>
        <span>
          Create a board containing only names of games. Useful if you want to
          race for Gifts, Gold Disks, or Cherry Disks across the collection.
        </span>
        <Text size="xs">
          <em>Created by UFOSoft</em>
        </Text>
      </Stack>
    ),
  },
  {
    type: "Custom",
    name: "Custom",
    isMenu: true,
    hovercard: (
      <Stack>
        <span>
          Create a board from a custom SRLv5 goal list. For advanced users only.
        </span>
        <Text size="xs">
          <em>Created by you!</em>
        </Text>
      </Stack>
    ),
  },
  {
    type: "UFO",
    name: "Choco",
    pasta: CHOCO_UFO,
    isMenu: true,
    hovercard: (
      <Stack>
        <span>
          Similar to Blitz bingo, goals are easier/faster than normal. But,
          pushes the “blitz” aspect further - most goals are <em>very</em> fast.
        </span>
        <Text size="xs">
          <em>Created by chocolatecake5000</em>
        </Text>
      </Stack>
    ),
  },
  {
    type: "UFO",
    name: "Campanella 3",
    pasta: CAMPANELLA3_UFO,
    isMenu: true,
    isGeneric: true,
    hovercard: (
      <Stack>
        <span>Mostly involves the “secret” minigames in Campanella 3.</span>
        <List>
          <List.Item>
            Access minigames by holding button 2 on the P2 controller during
            regular gameplay
          </List.Item>
          <List.Item>
            Minigames can still be played after a regular game over
          </List.Item>
        </List>
        <Text size="xs">
          <em>Created by RedRobot</em>
        </Text>
      </Stack>
    ),
  },
  {
    type: "UFO",
    name: "Clarity",
    pasta: CLARITY_UFO,
    isMenu: true,
    hovercard: (
      <Stack>
        <span>
          This goal set’s obtuse and wordy nature is a nod to an infamous bingo
          goal of the past.
        </span>
        <Text size="xs">
          <em>Created by Guri</em>
        </Text>
      </Stack>
    ),
  },
] as const;

export type Variant = (typeof RAW_METADATA)[number]["name"];

interface MetadataBase {
  name: Variant;
  hovercard: ReactNode;
  isMenu: boolean;
}

interface GameNames extends MetadataBase {
  type: "GameNames";
}

interface Custom extends MetadataBase {
  type: "Custom";
}

interface UFO extends MetadataBase {
  type: "UFO";
  pasta: UFOPasta;
  isGeneric?: boolean;
}

interface UFODraft extends MetadataBase {
  type: "UFODraft";
  pasta: UFOPasta;
}

export type VariantMetadata = GameNames | Custom | UFO | UFODraft;

export const METADATA: ReadonlyArray<VariantMetadata> = RAW_METADATA;
