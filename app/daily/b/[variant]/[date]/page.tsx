import { notFound } from "next/navigation";
import DailyFeedFetcher from "../../../DailyFeedFetcher";
import getDailyBoard, { DAILY_METADATA } from "../../../getDailyBoard";
import { fromISODate } from "../../../localDate";
import { getPracticeVariant } from "../../../../usePracticePasta";

export const metadata = DAILY_METADATA;
export const dynamic = "force-static";
export const dynamicParams = true;
export const revalidate = false;

export function generateStaticParams(): Array<{
  variant: string;
  date: string;
}> {
  return [];
}

export default async function CachedDailyPage(props: {
  params: Promise<{ variant: string; date: string }>;
}) {
  const { variant, date: isoDate } = await props.params;
  const typedVariant = getPracticeVariant(variant);
  if (typedVariant !== variant || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    notFound();
  }
  const date = fromISODate(isoDate);
  const dailyData = await getDailyBoard(date, typedVariant);
  return (
    <DailyFeedFetcher
      date={date}
      dailyData={dailyData}
      variant={typedVariant}
    />
  );
}
