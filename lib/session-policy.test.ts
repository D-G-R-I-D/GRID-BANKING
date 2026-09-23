import { describe, expect, it } from "vitest";
import {
  ABSOLUTE_TIMEOUT_MS,
  IDLE_TIMEOUT_MS,
  checkExpiry,
} from "./session-policy";

describe("checkExpiry", () => {
  const now = 1_000_000_000_000;

  it("passes a fresh, active session", () => {
    expect(
      checkExpiry({ createdAt: now - 1000, lastSeenAt: now - 1000 }, now),
    ).toBeNull();
  });

  it("expires on idle", () => {
    expect(
      checkExpiry(
        { createdAt: now, lastSeenAt: now - IDLE_TIMEOUT_MS - 1 },
        now,
      ),
    ).toBe("idle");
  });

  it("expires on the absolute cap even when active", () => {
    expect(
      checkExpiry(
        { createdAt: now - ABSOLUTE_TIMEOUT_MS - 1, lastSeenAt: now },
        now,
      ),
    ).toBe("absolute");
  });

  it("treats a cookie with no timers as expired", () => {
    expect(checkExpiry({}, now)).toBe("idle");
  });
});
