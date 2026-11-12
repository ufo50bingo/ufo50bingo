export const enum WEEK {
  WEEK_1,
  WEEK_2,
  WEEK_3,
  WEEK_4,
  WEEK_5,
  WEEK_6,
  WEEK_7,
  WEEK_8,
  QUARTERFINALS,
  SEMIFINALS,
  CHAMPIONSHIP,
  THIRD_PLACE,
}

export function displayWeek(week: WEEK): string {
  switch (week) {
    case WEEK.WEEK_1:
      return "Week 1";
    case WEEK.WEEK_2:
      return "Week 2";
    case WEEK.WEEK_3:
      return "Week 3";
    case WEEK.WEEK_4:
      return "Week 4";
    case WEEK.WEEK_5:
      return "Week 5";
    case WEEK.WEEK_6:
      return "Week 6";
    case WEEK.WEEK_7:
      return "Week 7";
    case WEEK.WEEK_8:
      return "Week 8";
    case WEEK.QUARTERFINALS:
      return "Quarterfinals";
    case WEEK.SEMIFINALS:
      return "Semifinals";
    case WEEK.CHAMPIONSHIP:
      return "Championship";
    case WEEK.THIRD_PLACE:
      return "Third Place";
  }
}
