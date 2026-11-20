import { isSingleCastImage } from "@/app/generator/castImages";
import { CastConfig, CastImage, UFOPasta } from "@/app/generator/ufoGenerator";

export const BUILT_IN_ICON_SETS: ReadonlyArray<string> = [
  "WinnerBit",
  "Sprites",
  "Classic",
];

const OLD_STORED_ICON_SETS: { readonly [stored: string]: string } = {
  winnerbit: "WinnerBit",
  sprites: "Sprites",
  classic: "Classic",
};

export function normalizeStoredIconSet(stored: string): string {
  return OLD_STORED_ICON_SETS[stored] ?? stored;
}

export function getPastaIconSets(
  pasta: null | UFOPasta,
): ReadonlyArray<string> {
  if (pasta == null) {
    return BUILT_IN_ICON_SETS;
  }
  let castCount = 0;
  let singleImageCount = 0;
  for (const subcategories of Object.values(pasta.goals)) {
    for (const goals of Object.values(subcategories)) {
      for (const goal of goals) {
        const cast = typeof goal === "string" ? null : goal.cast;
        if (cast == null) {
          continue;
        }
        castCount++;
        if (cast.image == null) {
          continue;
        }
        if (!isSingleCastImage(cast.image)) {
          return Object.keys(cast.image);
        }
        singleImageCount++;
      }
    }
  }
  return castCount > 0 && singleImageCount === castCount
    ? BUILT_IN_ICON_SETS.slice(0, 1)
    : BUILT_IN_ICON_SETS;
}

export function pickIconSet(
  stored: string,
  iconSets: ReadonlyArray<string>,
): string {
  return iconSets.includes(stored) ? stored : iconSets[0];
}

export function getCastImage(
  cast: null | undefined | CastConfig,
  iconSet: string,
): null | CastImage {
  const image = cast?.image;
  if (image == null) {
    return null;
  }
  return isSingleCastImage(image) ? image : (image[iconSet] ?? null);
}
