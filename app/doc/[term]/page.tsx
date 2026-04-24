import { Game, ORDERED_GAMES } from "@/app/goals";
import { DOC_LINKS } from "@/app/practice/docLinks";
import { SequenceMatcher } from "difflib";
import { redirect } from "next/navigation";

const ALIASES: { [alias: string]: Game } = {
  camp: "campanella",
  camp1: "campanella",
  camp2: "campanella2",
  camp3: "campanella3",
  campi: "campanella",
  campii: "campanella2",
  campiii: "campanella3",
  c1: "campanella",
  c2: "campanella2",
  c3: "campanella3",
  mortol1: "mortol",
  mortoli: "mortol",
  mortol2: "mortolii",
  m1: "mortol",
  mi: "mortol",
  m2: "mortolii",
  mii: "mortolii",
  pq: "pilotquest",
  rh: "railheist",
  roi: "rockonisland",
  lod: "lordsofdiskonia",
  mg: "magicgarden",
  pz: "planetzoldath",
  bk: "blockkoala",
  bbr: "thebigbellrace",
  bigbellrace: "thebigbellrace",
  od: "oniondelivery",
  carcar: "caramelcaramel",
  car: "caramelcaramel",
  ph: "partyhouse",
  hf: "hotfoot",
  hc: "hypercontender",
  ob: "overbold",
  sw: "starwaspir",
  mm: "miniandmax",
  mandm: "miniandmax",
  mini: "miniandmax",
  co: "cyberowls",
  gen: "general",
};

export default async function Page({
  params,
}: {
  params: Promise<{ term: string }>;
}) {
  const { term } = await params;

  let bestScore = null;
  let bestGame = null;

  for (const game of ORDERED_GAMES) {
    const score = new SequenceMatcher(null, game, term).ratio();
    if (bestScore == null || score > bestScore) {
      bestScore = score;
      bestGame = game;
    }
  }

  for (const alias of Object.keys(ALIASES)) {
    const score = new SequenceMatcher(null, alias, term).ratio();
    if (bestScore == null || score > bestScore) {
      bestScore = score;
      bestGame = ALIASES[alias];
    }
  }

  redirect(DOC_LINKS[bestGame!]);
}
