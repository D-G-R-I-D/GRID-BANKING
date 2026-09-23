/**
 * Cash-flow bucketing — pure, so it's unit-testable. Weeks start on Monday
 * in Lagos time (UTC+1, no daylight saving).
 */

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const LAGOS_OFFSET = HOUR;

/** Start of the Lagos week (Monday 00:00 Lagos) containing `at`, as an instant. */
export function lagosWeekStart(at: Date): Date {
  const local = new Date(at.getTime() + LAGOS_OFFSET);
  const daysSinceMonday = (local.getUTCDay() + 6) % 7;
  const midnight = Date.UTC(
    local.getUTCFullYear(),
    local.getUTCMonth(),
    local.getUTCDate() - daysSinceMonday,
  );
  return new Date(midnight - LAGOS_OFFSET);
}

export interface FlowMovement {
  at: Date;
  /** Positive = money came in to the user, negative = went out. */
  amountMinor: number;
}

export interface WeekBucket {
  weekStart: Date;
  inMinor: number;
  outMinor: number;
}

/** The last `weeks` weeks (oldest first, including this one), filled with totals. */
export function bucketByWeek(
  movements: FlowMovement[],
  weeks: number,
  now: Date = new Date(),
): WeekBucket[] {
  const thisWeek = lagosWeekStart(now).getTime();
  const buckets: WeekBucket[] = Array.from({ length: weeks }, (_, i) => ({
    weekStart: new Date(thisWeek - (weeks - 1 - i) * WEEK),
    inMinor: 0,
    outMinor: 0,
  }));
  const first = buckets[0]!.weekStart.getTime();

  for (const m of movements) {
    const t = m.at.getTime();
    if (t < first || t >= thisWeek + WEEK) continue;
    const bucket = buckets[Math.floor((t - first) / WEEK)]!;
    if (m.amountMinor >= 0) bucket.inMinor += m.amountMinor;
    else bucket.outMinor += -m.amountMinor;
  }
  return buckets;
}

/** Start of the window `bucketByWeek(…, weeks)` covers. */
export function windowStart(weeks: number, now: Date = new Date()): Date {
  return new Date(lagosWeekStart(now).getTime() - (weeks - 1) * WEEK);
}
