import { LayoutFont } from "./useFont";
import classes from "./getFontClassname.module.css";
import localFont from "next/font/local";
import { GOOGLE_FONTS } from "./googleFonts";

const UFO_50_FONT = localFont({
  src: "./ufo50.woff2",
});

export function getFontLabel(font: LayoutFont): string {
  switch (font) {
    case "default":
      return "Default";
    case "ufo50":
      return "UFO 50";
    default:
      return GOOGLE_FONTS[font].label;
  }
}

export function getFontFamily(font: LayoutFont): null | string {
  switch (font) {
    case "default":
      return null;
    case "ufo50":
      return UFO_50_FONT.style.fontFamily;
    default:
      return GOOGLE_FONTS[font].font.style.fontFamily;
  }
}

export default function getFontClassname(
  font: LayoutFont,
  isSmall: boolean = false,
  isDoubleDigitSideBySide: boolean = false,
): string {
  switch (font) {
    case "ufo50":
      return `${UFO_50_FONT.className} ${isSmall ? classes.ufo50small : isDoubleDigitSideBySide ? classes.ufo50DoubleSideBySide : classes.ufo50}`;
    case "default":
      return isDoubleDigitSideBySide ? classes.normalDoubleSideBySide : "";
    default:
      return `${GOOGLE_FONTS[font].font.className} ${isDoubleDigitSideBySide ? classes.normalDoubleSideBySide : ""}`;
  }
}
