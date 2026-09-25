/**
 * Loan product rules and maths — pure, integer minor units only.
 * Shared by the client (live quote while you choose) and the server (which
 * recomputes everything and never trusts the client's numbers).
 */

import { groupThousands } from "./money";

export const LOAN_MIN_MINOR = 5_000_00; // ₦5,000
export const LOAN_MAX_MINOR = 500_000_00; // ₦500,000
/** With both BVN and NIN added (lib/identity.ts). */
export const LOAN_MAX_VERIFIED_MINOR = 2_000_000_00; // ₦2,000,000
export const LOAN_TERMS = [1, 3, 6, 12] as const;
export type LoanTerm = (typeof LOAN_TERMS)[number];

/** Flat interest: 2.5% of the principal per month of the term. */
export const MONTHLY_RATE_BPS = 250;

/** Smallest custom repayment, unless less than that is left to pay. */
export const MIN_REPAYMENT_MINOR = 100_00; // ₦100

export type LoanPlanKind = "INSTALLMENTS" | "SINGLE";

export interface ScheduledInstallment {
  sequence: number;
  dueDate: Date;
  amountMinor: number;
}

export interface LoanQuote {
  principalMinor: number;
  interestMinor: number;
  totalMinor: number;
  monthlyRateBps: number;
  termMonths: number;
  plan: LoanPlanKind;
  schedule: ScheduledInstallment[];
}

export function isLoanTerm(n: number): n is LoanTerm {
  return (LOAN_TERMS as readonly number[]).includes(n);
}

/** Why an amount can't be borrowed, or null if it's fine. */
export function loanAmountError(
  principalMinor: number | null,
  maxMinor: number = LOAN_MAX_MINOR,
): string | null {
  if (principalMinor === null || principalMinor <= 0) {
    return "Enter a valid amount, e.g. 50000";
  }
  if (principalMinor < LOAN_MIN_MINOR) return "The smallest loan is ₦5,000";
  if (principalMinor > maxMinor) {
    return `The most you can borrow is ₦${groupThousands(maxMinor / 100)}`;
  }
  return null;
}

/** Flat interest, rounded half-up to the kobo. */
export function interestFor(
  principalMinor: number,
  termMonths: number,
  monthlyRateBps: number = MONTHLY_RATE_BPS,
): number {
  return Math.round((principalMinor * monthlyRateBps * termMonths) / 10_000);
}

/**
 * Same calendar day `months` later (UTC), clamped to the end of shorter
 * months: 31 Jan + 1 month = 28/29 Feb.
 */
export function addMonths(date: Date, months: number): Date {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + months;
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const out = new Date(date);
  out.setUTCFullYear(y, m, Math.min(date.getUTCDate(), lastDay));
  return out;
}

/**
 * Split `totalMinor` into `count` payments that differ by at most a kobo
 * per payment; any remainder lands on the last one so earlier payments are
 * round and the schedule always sums to the total exactly.
 */
export function splitEvenly(totalMinor: number, count: number): number[] {
  const base = Math.floor(totalMinor / count);
  const parts = Array.from({ length: count }, () => base);
  parts[count - 1]! += totalMinor - base * count;
  return parts;
}

export function quoteLoan(
  principalMinor: number,
  termMonths: LoanTerm,
  plan: LoanPlanKind,
  start: Date = new Date(),
): LoanQuote {
  const interestMinor = interestFor(principalMinor, termMonths);
  const totalMinor = principalMinor + interestMinor;

  const schedule: ScheduledInstallment[] =
    plan === "SINGLE"
      ? [
          {
            sequence: 1,
            dueDate: addMonths(start, termMonths),
            amountMinor: totalMinor,
          },
        ]
      : splitEvenly(totalMinor, termMonths).map((amountMinor, i) => ({
          sequence: i + 1,
          dueDate: addMonths(start, i + 1),
          amountMinor,
        }));

  return {
    principalMinor,
    interestMinor,
    totalMinor,
    monthlyRateBps: MONTHLY_RATE_BPS,
    termMonths,
    plan,
    schedule,
  };
}

export interface InstallmentBalance {
  id: string;
  amountMinor: number;
  paidMinor: number;
}

/**
 * Apply a payment to installments oldest-first. Returns how much goes to
 * each one. Throws if the payment is more than is owed — callers validate
 * against the outstanding balance first.
 */
export function allocateRepayment(
  installments: InstallmentBalance[],
  paymentMinor: number,
): { id: string; applyMinor: number; settles: boolean }[] {
  let left = paymentMinor;
  const out: { id: string; applyMinor: number; settles: boolean }[] = [];
  for (const inst of installments) {
    if (left === 0) break;
    const due = inst.amountMinor - inst.paidMinor;
    if (due <= 0) continue;
    const applyMinor = Math.min(due, left);
    out.push({ id: inst.id, applyMinor, settles: applyMinor === due });
    left -= applyMinor;
  }
  if (left > 0) throw new Error("Repayment exceeds the amount owed");
  return out;
}

/** Why a repayment amount isn't acceptable, or null. */
export function repaymentAmountError(
  amountMinor: number | null,
  outstandingMinor: number,
): string | null {
  if (amountMinor === null || amountMinor <= 0) {
    return "Enter a valid amount, e.g. 5000";
  }
  if (amountMinor > outstandingMinor) {
    return "That's more than you owe on this loan";
  }
  const floor = Math.min(MIN_REPAYMENT_MINOR, outstandingMinor);
  if (amountMinor < floor) return "The smallest payment is ₦100";
  return null;
}

export type InstallmentState =
  "paid" | "partial" | "overdue" | "due" | "upcoming";

/**
 * Where an installment stands today. "due" = the next one you owe (not yet
 * late); anything after it is "upcoming".
 */
export function installmentState(
  inst: { dueDate: Date; amountMinor: number; paidMinor: number },
  isNextUnpaid: boolean,
  now: Date = new Date(),
): InstallmentState {
  if (inst.paidMinor >= inst.amountMinor) return "paid";
  if (inst.dueDate.getTime() < now.getTime()) return "overdue";
  if (inst.paidMinor > 0) return "partial";
  return isNextUnpaid ? "due" : "upcoming";
}
