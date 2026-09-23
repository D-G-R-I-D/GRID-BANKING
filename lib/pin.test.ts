import { describe, expect, it } from "vitest";
import {
  MAX_PIN_ATTEMPTS,
  PIN_LOCK_MS,
  afterWrongPin,
  attemptAllowed,
  isPinFormat,
  isPinLocked,
  isWeakPin,
  lockMessage,
} from "./pin";

describe("isPinFormat", () => {
  it("accepts exactly 4 or 6 digits", () => {
    expect(isPinFormat("4826")).toBe(true);
    expect(isPinFormat("482619")).toBe(true);
  });

  it("rejects other lengths and non-digits", () => {
    for (const bad of ["", "123", "12345", "1234567", "12a4", " 4826"]) {
      expect(isPinFormat(bad)).toBe(false);
    }
  });
});

describe("isWeakPin", () => {
  it("rejects repeated digits and straight runs", () => {
    for (const weak of ["0000", "111111", "1234", "4567", "987654", "3210"]) {
      expect(isWeakPin(weak)).toBe(true);
    }
  });

  it("allows everything else", () => {
    for (const ok of ["2580", "4826", "1357", "1123", "902134"]) {
      expect(isWeakPin(ok)).toBe(false);
    }
  });
});

describe("PIN lockout", () => {
  const now = 1_000_000_000_000;

  it("allows attempts up to the limit, not beyond", () => {
    expect(attemptAllowed(1)).toBe(true);
    expect(attemptAllowed(MAX_PIN_ATTEMPTS)).toBe(true);
    expect(attemptAllowed(MAX_PIN_ATTEMPTS + 1)).toBe(false);
  });

  it("counts down the attempts left after a wrong PIN", () => {
    expect(afterWrongPin(1, now)).toEqual({
      attemptsLeft: MAX_PIN_ATTEMPTS - 1,
    });
  });

  it("locks on the last allowed wrong PIN", () => {
    expect(afterWrongPin(MAX_PIN_ATTEMPTS, now)).toEqual({
      lockedUntil: new Date(now + PIN_LOCK_MS),
    });
  });

  it("is locked only until the lock time passes", () => {
    const until = new Date(now + 1000);
    expect(isPinLocked(until, now)).toBe(true);
    expect(isPinLocked(until, now + 1000)).toBe(false);
    expect(isPinLocked(null, now)).toBe(false);
  });

  it("tells you how long to wait, rounding up", () => {
    expect(lockMessage(new Date(now + 61_000), now)).toMatch(/2 minutes/);
    expect(lockMessage(new Date(now + 10_000), now)).toMatch(/1 minute\./);
  });
});
