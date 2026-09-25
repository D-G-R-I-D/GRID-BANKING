import { describe, expect, it } from "vitest";
import {
  LOAN_MAX_MINOR,
  LOAN_MIN_MINOR,
  addMonths,
  allocateRepayment,
  installmentState,
  interestFor,
  loanAmountError,
  quoteLoan,
  repaymentAmountError,
  splitEvenly,
} from "./loan";

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

describe("loanAmountError", () => {
  it("accepts amounts inside the limits", () => {
    expect(loanAmountError(LOAN_MIN_MINOR)).toBeNull();
    expect(loanAmountError(LOAN_MAX_MINOR)).toBeNull();
  });

  it("rejects missing, too small and too large amounts", () => {
    expect(loanAmountError(null)).toMatch(/valid amount/);
    expect(loanAmountError(LOAN_MIN_MINOR - 1)).toMatch(/smallest/);
    expect(loanAmountError(LOAN_MAX_MINOR + 1)).toBe(
      "The most you can borrow is ₦500,000",
    );
  });

  it("respects a higher limit when one applies", () => {
    expect(loanAmountError(1_000_000_00, 2_000_000_00)).toBeNull();
    expect(loanAmountError(2_000_000_01, 2_000_000_00)).toMatch(/₦2,000,000/);
  });
});

describe("interestFor", () => {
  it("is flat 2.5% per month", () => {
    expect(interestFor(100_000_00, 1)).toBe(2_500_00);
    expect(interestFor(100_000_00, 12)).toBe(30_000_00);
  });

  it("rounds to the nearest kobo", () => {
    // 333.33 * 2.5% * 1 = 8.33325 -> 8.33
    expect(interestFor(333_33, 1)).toBe(8_33);
  });
});

describe("addMonths", () => {
  it("keeps the day of the month", () => {
    const d = addMonths(new Date("2026-03-15T10:00:00Z"), 1);
    expect(d.toISOString()).toBe("2026-04-15T10:00:00.000Z");
  });

  it("clamps to the end of a shorter month", () => {
    expect(addMonths(new Date("2026-01-31T00:00:00Z"), 1).toISOString()).toBe(
      "2026-02-28T00:00:00.000Z",
    );
    expect(addMonths(new Date("2028-01-31T00:00:00Z"), 1).toISOString()).toBe(
      "2028-02-29T00:00:00.000Z",
    );
  });

  it("rolls over the year", () => {
    expect(addMonths(new Date("2026-11-30T00:00:00Z"), 3).toISOString()).toBe(
      "2027-02-28T00:00:00.000Z",
    );
  });
});

describe("splitEvenly", () => {
  it("always sums to the total, remainder on the last part", () => {
    expect(splitEvenly(100_00, 3)).toEqual([33_33, 33_33, 33_34]);
    expect(sum(splitEvenly(515_000_00, 12))).toBe(515_000_00);
  });
});

describe("quoteLoan", () => {
  const start = new Date("2026-09-23T12:00:00Z");

  it("builds a monthly schedule that sums to principal + interest", () => {
    const q = quoteLoan(50_000_00, 6, "INSTALLMENTS", start);
    expect(q.interestMinor).toBe(7_500_00);
    expect(q.totalMinor).toBe(57_500_00);
    expect(q.schedule).toHaveLength(6);
    expect(sum(q.schedule.map((s) => s.amountMinor))).toBe(q.totalMinor);
    expect(q.schedule[0]!.dueDate.toISOString()).toBe(
      "2026-10-23T12:00:00.000Z",
    );
    expect(q.schedule[5]!.dueDate.toISOString()).toBe(
      "2027-03-23T12:00:00.000Z",
    );
  });

  it("'pay once' is a single payment at the end of the term", () => {
    const q = quoteLoan(50_000_00, 3, "SINGLE", start);
    expect(q.schedule).toEqual([
      {
        sequence: 1,
        dueDate: new Date("2026-12-23T12:00:00Z"),
        amountMinor: 53_750_00,
      },
    ]);
  });
});

describe("allocateRepayment", () => {
  const insts = [
    { id: "a", amountMinor: 100_00, paidMinor: 100_00 },
    { id: "b", amountMinor: 100_00, paidMinor: 40_00 },
    { id: "c", amountMinor: 100_00, paidMinor: 0 },
  ];

  it("pays the oldest unpaid installment first, skipping paid ones", () => {
    expect(allocateRepayment(insts, 60_00)).toEqual([
      { id: "b", applyMinor: 60_00, settles: true },
    ]);
  });

  it("spills over into the next installment", () => {
    expect(allocateRepayment(insts, 90_00)).toEqual([
      { id: "b", applyMinor: 60_00, settles: true },
      { id: "c", applyMinor: 30_00, settles: false },
    ]);
  });

  it("refuses to take more than is owed", () => {
    expect(() => allocateRepayment(insts, 160_01)).toThrow();
  });
});

describe("repaymentAmountError", () => {
  it("accepts anything from ₦100 up to what's owed", () => {
    expect(repaymentAmountError(100_00, 5_000_00)).toBeNull();
    expect(repaymentAmountError(5_000_00, 5_000_00)).toBeNull();
  });

  it("allows paying off a balance smaller than the minimum", () => {
    expect(repaymentAmountError(50_00, 50_00)).toBeNull();
  });

  it("rejects overpaying, tiny payments and junk", () => {
    expect(repaymentAmountError(5_000_01, 5_000_00)).toMatch(/more than/);
    expect(repaymentAmountError(99_99, 5_000_00)).toMatch(/smallest/);
    expect(repaymentAmountError(null, 5_000_00)).toMatch(/valid/);
  });
});

describe("installmentState", () => {
  const now = new Date("2026-09-23T00:00:00Z");
  const past = new Date("2026-09-01T00:00:00Z");
  const future = new Date("2026-10-01T00:00:00Z");

  it("classifies installments", () => {
    const base = { amountMinor: 100_00, paidMinor: 0 };
    expect(
      installmentState(
        { ...base, paidMinor: 100_00, dueDate: past },
        false,
        now,
      ),
    ).toBe("paid");
    expect(installmentState({ ...base, dueDate: past }, true, now)).toBe(
      "overdue",
    );
    expect(
      installmentState(
        { ...base, paidMinor: 10_00, dueDate: future },
        true,
        now,
      ),
    ).toBe("partial");
    expect(installmentState({ ...base, dueDate: future }, true, now)).toBe(
      "due",
    );
    expect(installmentState({ ...base, dueDate: future }, false, now)).toBe(
      "upcoming",
    );
  });
});
