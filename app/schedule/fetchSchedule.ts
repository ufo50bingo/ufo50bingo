import { google } from "googleapis";
import { DateTime } from "luxon";

const LEAGUE_SHEET_ID = "1FwNEMlF1KPdVADiPP539y2a2mDiyHpmoQclALHK9nCA";
const UNDERGROUND_SHEET_ID = "1OocDHEbrJC3BqO8qrPFCYxyy2nzqAaTT6Hmix076Ea0";
const OFFSEASON_SHEET_ID = "1FuvQLFIM38sZKXF4hnMtLWjWBo1jOokM659N-BRu2uk";
const SPICY_SHEET_ID = "1oQktL5q8eVWrI_Zbacjv-supFhuQI4h63tiVcMkan4E";
// Copy of the official sheet to help with debugging
// const LEAGUE_SHEET_ID = "1NdF25XWmISftQzATmOjSTLz-nE0dhwLIjbllgxDDTMk";

type Sheet = {
  sheetID: string;
  leaguePrefix: null | string;
};

const SHEETS: ReadonlyArray<Sheet> = [
  { sheetID: LEAGUE_SHEET_ID, leaguePrefix: "" },
  { sheetID: UNDERGROUND_SHEET_ID, leaguePrefix: "Underground " },
  { sheetID: OFFSEASON_SHEET_ID, leaguePrefix: null },
  { sheetID: SPICY_SHEET_ID, leaguePrefix: "" },
];

export type ScheduledMatch = {
  name: string;
  tier: null | string;
  time: number;
  streamer: null | string;
  streamLink: null | string;
};

const MANUAL_MATCHES: ReadonlyArray<ScheduledMatch> = [
  {
    name: "Random Name vs morraconda",
    tier: "Blind Beginner Bingo",
    time: 1760817600,
    streamer: "Matt",
    streamLink: "https://www.twitch.tv/kg28_/",
  },
  {
    name: "Random Name vs morraconda",
    tier: "Blind Beginner Bingo... 2!",
    time: 1761341400,
    streamer: "Nixill",
    streamLink: "https://twitch.tv/nixillshadowfox",
  },
];

async function fetchScheduleForSheet({
  sheetID,
  leaguePrefix,
}: Sheet): Promise<null | ReadonlyArray<ScheduledMatch>> {
  const auth = new google.auth.JWT({
    email: process.env.GSHEETS_ACCOUNT_EMAIL,
    key: process.env.GSHEETS_ACCOUNT_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheet = google.sheets("v4");

  const [matchesResult, streamersResult] = await Promise.all([
    sheet.spreadsheets.values.get(
      {
        spreadsheetId: sheetID,
        range: leaguePrefix == null ? `Matches!A1:D400` : `Matches!A1:G400`,
        auth,
        fields: "values",
      },
      {
        fetchImplementation,
      }
    ),
    sheet.spreadsheets.values.get(
      {
        spreadsheetId: sheetID,
        range: `Casters!B5:D100`,
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
      if (!link.startsWith("https://")) {
      }
      streamerToLink[streamer] =
        link.startsWith("https://") || link.startsWith("http://")
          ? link
          : "https://" + link;
    }
  });

  const currentTime = Math.round(Date.now() / 1000);
  // we want to show yesterday onward in the viewer's timezone
  // we don't know what the timezone is, so include 48 hrs
  const cutoff = currentTime - 2 * 24 * 60 * 60;
  const scheduled: null | undefined | ReadonlyArray<ScheduledMatch> =
    matchesResult.data.values
      ?.map((row) => {
        const time = leaguePrefix == null ? row[1] : row[4];
        const date = leaguePrefix == null ? row[2] : row[5];
        if (date == null || time == null) {
          return null;
        }

        const streamer = leaguePrefix == null ? row[3] : row[6];
        const name = leaguePrefix == null ? row[0] : `${row[2]} vs ${row[3]}`;
        const tier = leaguePrefix == null ? null : leaguePrefix + row[1];
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
          name,
          tier,
          time: dt.toSeconds(),
          streamer: streamer,
          streamLink: streamerToLink[streamer],
        };
      })
      .filter((match) => match != null);
  return scheduled ?? null;
}

export async function fetchSchedule(): Promise<null | ReadonlyArray<ScheduledMatch>> {
  const allSchedules = await Promise.all(
    SHEETS.map((sheet) => fetchScheduleForSheet(sheet))
  );
  const final = allSchedules
    .map((schedule) => schedule ?? [])
    .flat()
    .concat(MANUAL_MATCHES);
  final.sort((a, b) => a.time - b.time);
  return final;
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
