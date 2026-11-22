import { CastImage, CastImages } from "./ufoGenerator";

export function isSingleCastImage(image: CastImages): image is CastImage {
  return typeof (image as { src?: unknown }).src === "string";
}
