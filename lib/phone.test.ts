import { describe, expect, it } from "vitest";
import {
  accountNumberFromPhone,
  maskAccountNumber,
  normalizePhone,
} from "./phone";

describe("normalizePhone", () => {
  it.each([
    ["08031234567", "+2348031234567"],
    ["0803 123 4567", "+2348031234567"],
    ["2348031234567", "+2348031234567"],
    ["+234 803 123 4567", "+2348031234567"],
    ["8031234567", "+2348031234567"],
  ])("normalises %s", (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it.each(["", "0123", "12345678901234", "0803123456", "0103123456789"])(
    "rejects %s",
    (input) => {
      expect(normalizePhone(input)).toBeNull();
    },
  );
});

describe("accountNumberFromPhone", () => {
  it("takes the last 10 digits", () => {
    expect(accountNumberFromPhone("+2348031234567")).toBe("8031234567");
  });
});

describe("maskAccountNumber", () => {
  it("shows only the last four", () => {
    expect(maskAccountNumber("8031234567")).toBe("•••• •• 4567");
  });
});
