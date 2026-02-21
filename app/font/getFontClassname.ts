import { Font } from "./useFont";
import classes from "./getFontClassname.module.css";
import localFont from 'next/font/local'

export const UFO_50_FONT = localFont({
  src: './ufo50.woff2',
});

export default function getFontClassname(font: Font, isSmall: boolean = false): string {
  switch (font) {
    case "ufo50":
      return `${UFO_50_FONT.className} ${isSmall ? classes.ufo50small : classes.ufo50}`;
    case "default":
      return "";
  }
}