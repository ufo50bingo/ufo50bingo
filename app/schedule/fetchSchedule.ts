import { google } from "googleapis";
import { DateTime } from "luxon";

// const LEAGUE_SHEET_ID = "1FwNEMlF1KPdVADiPP539y2a2mDiyHpmoQclALHK9nCA";
// Copy of the official sheet to help with debugging
const LEAGUE_SHEET_ID = "1NdF25XWmISftQzATmOjSTLz-nE0dhwLIjbllgxDDTMk";

export type ScheduledMatch = {
  name: string;
  tier: string;
  time: number;
  streamer: null | string;
  streamLink: null | string;
};

export async function fetchSchedule(): Promise<null | ReadonlyArray<ScheduledMatch>> {
  const auth = new google.auth.JWT({
    email: process.env.GSHEETS_ACCOUNT_EMAIL,
    key: process.env.GSHEETS_ACCOUNT_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheet = google.sheets("v4");

  const [matchesResult, streamersResult] = await Promise.all([
    sheet.spreadsheets.values.get(
      {
        spreadsheetId: LEAGUE_SHEET_ID,
        range: `Matches!A1:G400`,
        auth,
        fields: "values",
      },
      {
        fetchImplementation,
      }
    ),
    sheet.spreadsheets.values.get(
      {
        spreadsheetId: LEAGUE_SHEET_ID,
        range: `Casters!B5:D50`,
        auth,
        fields: "values",
      },
      { fetchImplementation }
    ),
  ]);

  const streamerToLink: { [streamer: string]: string } = {};
  streamersResult.data.values?.forEach((streamerRow) => {
    const streamer: string | null = streamerRow[0];
    const link: string | null = streamerRow[2];
    if (streamer != null && link != null) {
      streamerToLink[streamer] = link;
    }
  });

  const currentTime = Math.round(Date.now() / 1000);
  // we want to show yesterday onward in the viewer's timezone
  // we don't know what the timezone is, so include 48 hrs
  const cutoff = currentTime - 2 * 24 * 60 * 60;
  const scheduled = matchesResult.data.values
    ?.map((row) => {
      const [_week, tier, p1, p2, time, date, streamer] = row;
      if (date == null || time == null) {
        return null;
      }
      const dt = DateTime.fromFormat(date + " " + time, "M/d/yyyy h:mm a", {
        zone: "America/New_York",
      });
      if (!dt.isValid) {
        return null;
      }
      if (dt.toSeconds() < cutoff) {
        return null;
      }
      return {
        name: `${p1} vs ${p2}`,
        tier: tier,
        time: dt.toSeconds(),
        streamer: streamer,
        streamLink: streamerToLink[streamer],
      };
    })
    .filter((match) => match != null);
  if (scheduled == null) {
    return null;
  }
  scheduled.sort((a, b) => a.time - b.time);
  return scheduled ?? null;
}

function fetchImplementation(
  input: string | URL | globalThis.Request,
  init?: RequestInit
) {
  return fetch(input, {
    ...init,
    next: { revalidate: 3600 },
  });
}
