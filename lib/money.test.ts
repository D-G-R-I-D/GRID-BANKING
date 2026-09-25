import { describe, expect, it } from "vitest";
import { formatMoney, groupThousands, parseAmountToMinor } from "./money";

describe("formatMoney", () => {
  it("formats whole and fractional amounts in naira", () => {
    expect(formatMoney(0)).toMatch(/(₦|NGN)\s?0\.00/);
    expect(formatMoney(2_50)).toMatch(/(₦|NGN)\s?2\.50/);
    expect(formatMoney(1_234_56)).toMatch(/(₦|NGN)\s?1,234\.56/);
  });

  it("is identical in every runtime for naira", () => {
    expect(formatMoney(1_234_567_89)).toBe("₦1,234,567.89");
    expect(formatMoney(5)).toBe("₦0.05");
    expect(formatMoney(-2_50)).toBe("-₦2.50");
  });

  it("handles negatives", () => {
    expect(formatMoney(-99)).toMatch(/-.*(₦|NGN)\s?0\.99/);
  });

  it("respects an explicit currency", () => {
    expect(formatMoney(1000, "USD")).toMatch(/\$?\s?10\.00|USD\s?10\.00/);
  });

  it("rejects non-integer minor units", () => {
    expect(() => formatMoney(10.5)).toThrow();
  });
});

describe("parseAmountToMinor", () => {
  it.each([
    ["1", 100],
    ["1.5", 150],
    ["1.05", 105],
    ["1,234.56", 123456],
    ["₦12", 1200],
    ["0.01", 1],
  ])("parses %s -> %d", (input, expected) => {
    expect(parseAmountToMinor(input)).toBe(expected);
  });

  it.each(["", "abc", "1.234", "-5", "1.", "."])("rejects %s", (input) => {
    expect(parseAmountToMinor(input)).toBeNull();
  });
});

describe("groupThousands", () => {
  it("adds commas", () => {
    expect(groupThousands(0)).toBe("0");
    expect(groupThousands(1000)).toBe("1,000");
    expect(groupThousands(50000)).toBe("50,000");
  });
});
