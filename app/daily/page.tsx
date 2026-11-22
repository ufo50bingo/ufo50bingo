import { fromISODate, getEasternDate, toISODate } from "./localDate";
import DailyFeedFetcher from "./DailyFeedFetcher";
import getIsAdmin from "../getIsAdmin";
import { redirect, RedirectType } from "next/navigation";
import { getPracticeVariant } from "../usePracticePasta";
import getDailyBoard, { DAILY_METADATA } from "./getDailyBoard";

export type { DailyData } from "./getDailyBoard";
export const metadata = DAILY_METADATA;

// most requests are rewritten by proxy.ts to the cached /daily/b route;
// this dynamic page only handles future dates (admin only) and unusual params
export const dynamic = "force-dynamic";

type FilterParams = {
  date?: string;
  v?: string;
};

export default async function DailyPage(props: {
  searchParams?: Promise<FilterParams>;
}) {
  const [params, isAdmin] = await Promise.all([
    props.searchParams,
    getIsAdmin(),
  ]);

  const dateParam = params?.date;
  const variant = params?.v;
  // only allow admins to look into the future
  if (
    dateParam != null &&
    dateParam > toISODate(getEasternDate()) &&
    !isAdmin
  ) {
    if (variant == null) {
      redirect("/daily", RedirectType.replace);
    } else {
      const newParams = new URLSearchParams();
      newParams.append("v", variant);
      redirect(`/daily?${newParams}`, RedirectType.replace);
    }
  }

  const typedVariant = getPracticeVariant(variant);

  const date = dateParam == null ? getEasternDate() : fromISODate(dateParam);
  const dailyData = await getDailyBoard(date, typedVariant);
  return (
    <DailyFeedFetcher
      date={date}
      dailyData={dailyData}
      variant={typedVariant}
    />
  );
}
