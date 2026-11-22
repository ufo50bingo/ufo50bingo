import { NextRequest, NextResponse } from "next/server";
import { getEasternDate, toISODate } from "./app/daily/localDate";
import type { PracticeVariant } from "./app/PracticeVariantContext";

const VARIANTS: Record<PracticeVariant, true> = {
  standard: true,
  spicy: true,
  blitz: true,
  choco: true,
  nes50: true,
};

function isVariant(variant: string): variant is PracticeVariant {
  return Object.hasOwn(VARIANTS, variant);
}

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // keep this internal-only so people can't get to future dates
  if (pathname.startsWith("/daily/b")) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.next();
  }

  const variant = searchParams.get("v") ?? "standard";
  const today = toISODate(getEasternDate());
  const date = searchParams.get("date") ?? today;
  if (
    !isVariant(variant) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    date > today
  ) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(
    new URL(`/daily/b/${variant}/${date}`, request.url),
  );
}

export const config = {
  matcher: ["/daily", "/daily/b/:path*"],
};
