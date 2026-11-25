import {
  Anton,
  Audiowide,
  Bangers,
  Barlow_Condensed,
  Bebas_Neue,
  Exo_2,
  Fredoka,
  Inter,
  JetBrains_Mono,
  Lilita_One,
  Montserrat,
  Nunito,
  Orbitron,
  Oswald,
  Pixelify_Sans,
  Poppins,
  Press_Start_2P,
  Roboto,
  Russo_One,
  Silkscreen,
  Teko,
  VT323,
} from "next/font/google";

const inter = Inter({ subsets: ["latin"], preload: false });
const roboto = Roboto({ subsets: ["latin"], preload: false });
const montserrat = Montserrat({ subsets: ["latin"], preload: false });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  preload: false,
});
const nunito = Nunito({ subsets: ["latin"], preload: false });
const oswald = Oswald({ subsets: ["latin"], preload: false });
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  preload: false,
});
const anton = Anton({ subsets: ["latin"], weight: "400", preload: false });
const teko = Teko({ subsets: ["latin"], preload: false });
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "700"],
  preload: false,
});
const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  preload: false,
});
const vt323 = VT323({ subsets: ["latin"], weight: "400", preload: false });
const silkscreen = Silkscreen({
  subsets: ["latin"],
  weight: ["400", "700"],
  preload: false,
});
const pixelifySans = Pixelify_Sans({ subsets: ["latin"], preload: false });
const orbitron = Orbitron({ subsets: ["latin"], preload: false });
const exo2 = Exo_2({ subsets: ["latin"], preload: false });
const russoOne = Russo_One({
  subsets: ["latin"],
  weight: "400",
  preload: false,
});
const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  preload: false,
});
const fredoka = Fredoka({ subsets: ["latin"], preload: false });
const bangers = Bangers({ subsets: ["latin"], weight: "400", preload: false });
const lilitaOne = Lilita_One({
  subsets: ["latin"],
  weight: "400",
  preload: false,
});
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], preload: false });

type LoadedFont = { className: string; style: { fontFamily: string } };

// to add a font, load it above and add it here. The keys are saved in local
// storage and layouts, so don't rename them.
export const GOOGLE_FONTS = {
  inter: { label: "Inter", font: inter },
  roboto: { label: "Roboto", font: roboto },
  montserrat: { label: "Montserrat", font: montserrat },
  poppins: { label: "Poppins", font: poppins },
  nunito: { label: "Nunito", font: nunito },
  oswald: { label: "Oswald", font: oswald },
  bebas_neue: { label: "Bebas Neue", font: bebasNeue },
  anton: { label: "Anton", font: anton },
  teko: { label: "Teko", font: teko },
  barlow_condensed: { label: "Barlow Condensed", font: barlowCondensed },
  press_start_2p: { label: "Press Start 2P", font: pressStart2P },
  vt323: { label: "VT323", font: vt323 },
  silkscreen: { label: "Silkscreen", font: silkscreen },
  pixelify_sans: { label: "Pixelify Sans", font: pixelifySans },
  orbitron: { label: "Orbitron", font: orbitron },
  exo_2: { label: "Exo 2", font: exo2 },
  russo_one: { label: "Russo One", font: russoOne },
  audiowide: { label: "Audiowide", font: audiowide },
  fredoka: { label: "Fredoka", font: fredoka },
  bangers: { label: "Bangers", font: bangers },
  lilita_one: { label: "Lilita One", font: lilitaOne },
  jetbrains_mono: { label: "JetBrains Mono", font: jetBrainsMono },
} as const satisfies Record<string, { label: string; font: LoadedFont }>;

export type GoogleFont = keyof typeof GOOGLE_FONTS;

export const GOOGLE_FONT_KEYS = Object.keys(GOOGLE_FONTS) as Array<GoogleFont>;
