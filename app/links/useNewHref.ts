import { UrlObject } from "url";
import { useSearchParams } from "next/navigation";

const VALID_PATHNAMES = [
  "/",
  "/about",
  "/matches",
  "/schedule",
  "/daily",
  "/resources",
  "/practice",
  "/playlist",
  "/goals",
  "/settings",
];

export default function useNewHref(href: string | UrlObject): null | string {
  const searchParams = useSearchParams();
  const v = searchParams.get("v");
  if (v == null) {
    return null;
  }

  if (typeof href !== "string") {
    throw new Error("useNewHref only supports string hrefs");
  }

  const split = href.split("?");
  const pathname = split[0];
  if (!VALID_PATHNAMES.includes(pathname) || split.length > 2) {
    return null;
  }
  const newSearchParams = new URLSearchParams(
    split.length > 1 ? split[1] : undefined
  );
  newSearchParams.set("v", v);
  return `${pathname}?${newSearchParams.toString()}`;
}
