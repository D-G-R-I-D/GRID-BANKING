/**
 * Dates are shown in Lagos time everywhere, on the server and in the
 * browser alike, so a due date never renders as a different day (or
 * mismatches during hydration) depending on where it's formatted.
 */
const TZ = "Africa/Lagos";

/** "23 Oct 2026" */
export function formatDay(date: Date): string {
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TZ,
  });
}

/** "23 Oct" — for places where the year is obvious. */
export function formatShortDay(date: Date): string {
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    timeZone: TZ,
  });
}
