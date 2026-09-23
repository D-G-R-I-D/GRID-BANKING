import { describe, expect, it } from "vitest";
import {
  airtimeAmountError,
  findPlan,
  formatLocalPhone,
  isTopUpPhone,
  plansForNetwork,
  priceTopUp,
} from "./topup";

describe("phone", () => {
  it("accepts 10-digit Nigerian mobile numbers without the 0", () => {
    expect(isTopUpPhone("8012345678")).toBe(true);
    expect(isTopUpPhone("08012345678")).toBe(false);
    expect(isTopUpPhone("1012345678")).toBe(false);
  });

  it("formats for display", () => {
    expect(formatLocalPhone("8012345678")).toBe("0801 234 5678");
  });
});

describe("airtimeAmountError", () => {
  it("allows ₦50 to ₦50,000 in whole naira", () => {
    expect(airtimeAmountError(50)).toBeNull();
    expect(airtimeAmountError(50_000)).toBeNull();
  });

  it("rejects out-of-range and junk", () => {
    expect(airtimeAmountError(49)).toMatch(/Minimum/);
    expect(airtimeAmountError(50_001)).toMatch(/Maximum/);
    expect(airtimeAmountError(null)).toMatch(/Enter/);
    expect(airtimeAmountError(10.5)).toMatch(/Enter/);
  });
});

describe("data plans", () => {
  it("only lists a network's own bundles", () => {
    const mtn = plansForNetwork("mtn");
    expect(mtn.length).toBeGreaterThan(0);
    expect(mtn.every((p) => p.network === "MTN")).toBe(true);
  });

  it("won't sell one network's plan on another", () => {
    expect(findPlan("mtn", "mtn-1.5gb")).toBeDefined();
    expect(findPlan("glo", "mtn-1.5gb")).toBeUndefined();
  });
});

describe("priceTopUp", () => {
  it("prices airtime from the amount", () => {
    const r = priceTopUp({
      kind: "airtime",
      network: "mtn",
      phone: "8012345678",
      amount: "500",
    });
    expect(r).toMatchObject({
      ok: true,
      order: { amountMinor: 500_00, note: "MTN airtime · 0801 234 5678" },
    });
  });

  it("prices data from the plan list, not the client", () => {
    const r = priceTopUp({
      kind: "data",
      network: "mtn",
      phone: "8012345678",
      planId: "mtn-1.5gb",
    });
    expect(r).toMatchObject({ ok: true, order: { amountMinor: 500_00 } });
  });

  it("refuses bad input", () => {
    expect(
      priceTopUp({
        kind: "airtime",
        network: "nope",
        phone: "8012345678",
        amount: "500",
      }).ok,
    ).toBe(false);
    expect(
      priceTopUp({
        kind: "airtime",
        network: "mtn",
        phone: "123",
        amount: "500",
      }).ok,
    ).toBe(false);
    expect(
      priceTopUp({
        kind: "airtime",
        network: "mtn",
        phone: "8012345678",
        amount: "5.5",
      }).ok,
    ).toBe(false);
    expect(
      priceTopUp({
        kind: "data",
        network: "glo",
        phone: "8012345678",
        planId: "mtn-1.5gb",
      }).ok,
    ).toBe(false);
  });
});
