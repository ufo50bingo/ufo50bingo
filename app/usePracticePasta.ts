import { UFOPasta } from "./generator/ufoGenerator";
import { BLITZ_UFO } from "./pastas/blitzUfo";
import { CHOCO_UFO } from "./pastas/chocoUfo";
import { SPICY_UFO } from "./pastas/spicyUfo";
import { STANDARD_UFO } from "./pastas/standardUfo";
import { usePracticeVariant } from "./PracticeVariantContext";

export const ALL_PRACTICE_PASTAS: ReadonlyArray<UFOPasta> = [
  STANDARD_UFO,
  SPICY_UFO,
  BLITZ_UFO,
  CHOCO_UFO,
];

export default function usePracticePasta(): UFOPasta {
  const pv = usePracticeVariant();
  switch (pv) {
    case "spicy":
      return SPICY_UFO;
    case "blitz":
      return BLITZ_UFO;
    case "choco":
      return CHOCO_UFO;
    case "standard":
    // not sure why default is required here
    default:
      return STANDARD_UFO;
  }
}
