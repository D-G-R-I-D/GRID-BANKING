import { describe, expect, it } from "vitest";
import { bucketByWeek, lagosWeekStart, windowStart } from "./insights";

describe("lagosWeekStart", () => {
  it("is Monday 00:00 in Lagos (23:00 UTC on Sunday)", () => {
    // Wednesday 23 Sep 2026, midday UTC
    expect(lagosWeekStart(new Date("2026-09-23T12:00:00Z")).toISOString()).toBe(
      "2026-09-20T23:00:00.000Z",
    );
  });

  it("puts Sunday 23:30 UTC (Monday 00:30 Lagos) in the new week", () => {
    expect(lagosWeekStart(new Date("2026-09-20T23:30:00Z")).toISOString()).toBe(
      "2026-09-20T23:00:00.000Z",
    );
  });
});

describe("bucketByWeek", () => {
  const now = new Date("2026-09-23T12:00:00Z");

  it("returns the requested weeks, oldest first, ending this week", () => {
    const b = bucketByWeek([], 3, now);
    expect(b.map((w) => w.weekStart.toISOString())).toEqual([
      "2026-09-06T23:00:00.000Z",
      "2026-09-13T23:00:00.000Z",
      "2026-09-20T23:00:00.000Z",
    ]);
    expect(windowStart(3, now)).toEqual(b[0]!.weekStart);
  });

  it("sums money in and out per week, ignoring anything outside", () => {
    const b = bucketByWeek(
      [
        { at: new Date("2026-09-22T09:00:00Z"), amountMinor: 50_000_00 },
        { at: new Date("2026-09-22T10:00:00Z"), amountMinor: -3_000_00 },
        { at: new Date("2026-09-15T10:00:00Z"), amountMinor: -1_000_00 },
        { at: new Date("2026-08-01T10:00:00Z"), amountMinor: 9_999_00 },
      ],
      2,
      now,
    );
    expect(b).toEqual([
      {
        weekStart: new Date("2026-09-13T23:00:00Z"),
        inMinor: 0,
        outMinor: 1_000_00,
      },
      {
        weekStart: new Date("2026-09-20T23:00:00Z"),
        inMinor: 50_000_00,
        outMinor: 3_000_00,
      },
    ]);
  });
});
