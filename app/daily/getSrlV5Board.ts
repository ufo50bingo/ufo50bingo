import { TBoard } from "../matches/parseBingosyncData";
import { OtherPasta } from "../pastas/metadata";
import srl_generator_v5 from "./srl_generator_v5";

type SrlV5Square = {
  difficulty: number;
  name: string;
  synergy: number;
  types: string[];
};

export default function getSrlV5Board(pasta: OtherPasta): TBoard {
  const srlV5Board = srl_generator_v5(pasta, {}) as unknown as SrlV5Square[];
  // remove the dummy entry
  srlV5Board.shift();
  return srlV5Board.map((s) => ({
    name: s.name,
    color: "blank",
  }));
}
