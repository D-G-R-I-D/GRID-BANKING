import { describe, expect, it } from "vitest";
import {
  dayGroupLabel,
  formatDateTime,
  formatDay,
  formatShortDay,
  formatTime,
  lagosHour,
} from "./date";

describe("Lagos date formatting", () => {
  // 23:30 UTC on 22 Sep is already 00:30 on 23 Sep in Lagos.
  const lateUtc = new Date("2026-09-22T23:30:00Z");

  it("uses Lagos time, not the machine's", () => {
    expect(formatDay(lateUtc)).toBe("23 Sep 2026");
    expect(formatShortDay(lateUtc)).toBe("23 Sep");
    expect(formatTime(lateUtc)).toBe("12:30 am");
    expect(lagosHour(lateUtc)).toBe(0);
  });

  it("formats 12-hour times and date-times", () => {
    expect(formatTime(new Date("2026-09-23T14:05:00Z"))).toBe("3:05 pm");
    expect(formatTime(new Date("2026-09-23T11:00:00Z"))).toBe("12:00 pm");
    expect(formatDateTime(new Date("2026-09-23T14:05:00Z"))).toBe(
      "23 Sep 2026, 3:05 pm",
    );
  });

  it("labels activity groups", () => {
    const now = new Date("2026-09-23T12:00:00Z");
    expect(dayGroupLabel(new Date("2026-09-23T08:00:00Z"), now)).toBe("Today");
    expect(dayGroupLabel(new Date("2026-09-22T08:00:00Z"), now)).toBe(
      "Yesterday",
    );
    expect(dayGroupLabel(new Date("2026-09-15T08:00:00Z"), now)).toBe(
      "15 September",
    );
  });
});
