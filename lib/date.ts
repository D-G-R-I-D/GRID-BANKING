/**
 * Dates, always in Lagos time (UTC+1, no daylight saving), formatted by hand.
 *
 * Deliberately not Intl/toLocale*: pages render on the server and again in
 * the browser, and phones ship different locale data ("Sept" vs "Sep",
 * "am" vs "AM", another time zone). Any difference breaks hydration. Plain
 * arithmetic gives the same string everywhere.
 */
const LAGOS_OFFSET_MS = 3_600_000;
const DAY_MS = 86_400_000;
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** The Lagos wall-clock parts of an instant. */
function lagos(date: Date) {
  const d = new Date(date.getTime() + LAGOS_OFFSET_MS);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth(),
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
  };
}

/** "23 Oct 2026" */
export function formatDay(date: Date): string {
  const { day, month, year } = lagos(date);
  return `${day} ${MONTHS[month]} ${year}`;
}

/** "23 Oct" — for places where the year is obvious. */
export function formatShortDay(date: Date): string {
  const { day, month } = lagos(date);
  return `${day} ${MONTHS[month]}`;
}

/** "3:05 pm" */
export function formatTime(date: Date): string {
  const { hour, minute } = lagos(date);
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "am" : "pm"}`;
}

/** "23 Oct 2026, 3:05 pm" */
export function formatDateTime(date: Date): string {
  return `${formatDay(date)}, ${formatTime(date)}`;
}

/** The Lagos hour (0–23), e.g. for "Good morning". */
export function lagosHour(date: Date = new Date()): number {
  return lagos(date).hour;
}

/** Activity group heading: "Today", "Yesterday" or "23 September". */
export function dayGroupLabel(date: Date, now: Date = new Date()): string {
  const key = (d: Date) => {
    const p = lagos(d);
    return `${p.year}-${p.month}-${p.day}`;
  };
  if (key(date) === key(now)) return "Today";
  if (key(date) === key(new Date(now.getTime() - DAY_MS))) return "Yesterday";
  const { day, month } = lagos(date);
  return `${day} ${MONTHS_LONG[month]}`;
}
