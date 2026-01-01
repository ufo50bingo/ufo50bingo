export type LocalDate = {
  year: number;
  month: number;
  day: number;
};

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDaysInMonth(month: number, year: number): number {
  switch (month) {
    case 2:
      return isLeapYear(year) ? 29 : 28;
    case 1:
    case 3:
    case 5:
    case 7:
    case 8:
    case 10:
    case 12:
      return 31;
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
    default:
      throw new Error(`Invalid month ${month}`);
  }
}

export function getPrevDate(date: LocalDate): LocalDate {
  if (date.month === 1 && date.day === 1) {
    return { day: 31, month: 12, year: date.year - 1 };
  }
  if (date.day === 1) {
    return {
      day: getDaysInMonth(date.month - 1, date.year),
      month: date.month - 1,
      year: date.year,
    };
  }
  return { day: date.day - 1, month: date.month, year: date.year };
}

export function getPrevISODates(
  date: LocalDate,
  prevCount: number
): ReadonlyArray<string> {
  const prevWeek = [];
  let curDate = date;
  for (let i = 1; i <= prevCount; i++) {
    curDate = getPrevDate(curDate);
    prevWeek.push(toISODate(curDate));
  }
  return prevWeek;
}

export function toISODate({ year, month, day }: LocalDate): string {
  return `${year}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
}

export function fromISODate(isoDate: string): LocalDate {
  const [yearStr, monthStr, dayStr] = isoDate.split("-");
  return {
    year: Number(yearStr),
    month: Number(monthStr),
    day: Number(dayStr),
  };
}
