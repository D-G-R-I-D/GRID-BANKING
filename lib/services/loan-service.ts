import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  allocateRepayment,
  installmentState,
  isLoanTerm,
  loanAmountError,
  quoteLoan,
  repaymentAmountError,
} from "@/lib/loan";
import { parseAmountToMinor } from "@/lib/money";
import { transferReference } from "@/lib/reference";
import { findFlowAccount, LENDING_ACCOUNT_ID } from "@/lib/data/accounts";
import { getIdentity } from "@/lib/services/identity-service";
import {
  findActiveLoan,
  findLoanIdByTransferKey,
  listLoansByUser,
  type LoanWithSchedule,
} from "@/lib/data/loans";
import type {
  LoanApplicationInput,
  LoanRepaymentInput,
} from "@/lib/validation";
import type { LoanSnapshotView, LoansView, LoanView } from "@/lib/view";

export type LoanResult =
  { ok: true; loanId: string } | { ok: false; error: string };

class LoanError extends Error {}

// --- reads ------------------------------------------------------------------

export function toLoanView(loan: LoanWithSchedule, now = new Date()): LoanView {
  const nextUnpaid = loan.installments.find((i) => i.paidMinor < i.amountMinor);
  const overdueMinor = loan.installments
    .filter((i) => i.dueDate < now)
    .reduce((sum, i) => sum + (i.amountMinor - i.paidMinor), 0);

  return {
    id: loan.id,
    reference: transferReference(loan.id),
    principalMinor: loan.principalMinor,
    interestMinor: loan.interestMinor,
    totalMinor: loan.totalMinor,
    repaidMinor: loan.repaidMinor,
    outstandingMinor: loan.totalMinor - loan.repaidMinor,
    overdueMinor,
    monthlyRateBps: loan.monthlyRateBps,
    termMonths: loan.termMonths,
    plan: loan.plan,
    status: loan.status,
    createdAt: loan.createdAt,
    closedAt: loan.closedAt,
    nextDue: nextUnpaid
      ? {
          dueDate: nextUnpaid.dueDate,
          amountMinor: nextUnpaid.amountMinor - nextUnpaid.paidMinor,
          overdue: nextUnpaid.dueDate < now,
        }
      : null,
    installments: loan.installments.map((i) => ({
      sequence: i.sequence,
      dueDate: i.dueDate,
      amountMinor: i.amountMinor,
      paidMinor: i.paidMinor,
      state: installmentState(i, i.id === nextUnpaid?.id, now),
    })),
  };
}

export async function getLoans(userId: string): Promise<LoansView> {
  const [loans, flow] = await Promise.all([
    listLoansByUser(userId),
    findFlowAccount(userId),
  ]);
  const views = loans.map((l) => toLoanView(l));
  return {
    active: views.find((l) => l.status === "ACTIVE") ?? null,
    past: views.filter((l) => l.status !== "ACTIVE"),
    flowBalanceMinor: flow?.balanceMinor ?? 0,
    currency: flow?.currency ?? "NGN",
  };
}

/** The small "you owe" card on the dashboard. */
export async function getLoanSnapshot(
  userId: string,
): Promise<LoanSnapshotView | null> {
  const loan = await findActiveLoan(userId);
  if (!loan) return null;
  const view = toLoanView(loan);
  return { outstandingMinor: view.outstandingMinor, nextDue: view.nextDue };
}

// --- writes -----------------------------------------------------------------

/**
 * Serialise loan operations per user by locking their row for the rest of
 * the transaction. Stops two tabs taking two loans, or two repayments racing.
 */
async function lockUser(tx: Prisma.TransactionClient, userId: string) {
  await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;
}

/** Take a loan: pay the principal into Flow and write the schedule. */
export async function applyForLoan(
  userId: string,
  input: LoanApplicationInput,
): Promise<LoanResult> {
  const principalMinor = parseAmountToMinor(input.amount);
  const { loanLimitMinor } = await getIdentity(userId);
  const amountError = loanAmountError(principalMinor, loanLimitMinor);
  if (amountError || principalMinor === null) {
    return { ok: false, error: amountError ?? "Enter a valid amount" };
  }
  if (!isLoanTerm(input.termMonths)) {
    return { ok: false, error: "Choose a term" };
  }
  const quote = quoteLoan(principalMinor, input.termMonths, input.plan);

  return runLoanTx(input.idempotencyKey, async (tx) => {
    await lockUser(tx, userId);

    const active = await tx.loan.findFirst({
      where: { userId, status: "ACTIVE" },
      select: { id: true },
    });
    if (active) {
      throw new LoanError("Repay your current loan before taking another");
    }

    const flow = await tx.account.findFirst({
      where: { userId, kind: "FLOW" },
    });
    if (!flow) throw new LoanError("Account not found");

    const transfer = await tx.transfer.create({
      data: {
        fromAccountId: LENDING_ACCOUNT_ID,
        toAccountId: flow.id,
        amountMinor: principalMinor,
        currency: flow.currency,
        note: "Loan disbursement",
        idempotencyKey: input.idempotencyKey,
      },
    });
    await tx.account.update({
      where: { id: LENDING_ACCOUNT_ID },
      data: { balanceMinor: { decrement: principalMinor } },
    });
    await tx.account.update({
      where: { id: flow.id },
      data: { balanceMinor: { increment: principalMinor } },
    });

    const loan = await tx.loan.create({
      data: {
        userId,
        accountId: flow.id,
        principalMinor: quote.principalMinor,
        interestMinor: quote.interestMinor,
        totalMinor: quote.totalMinor,
        monthlyRateBps: quote.monthlyRateBps,
        termMonths: quote.termMonths,
        plan: quote.plan,
        disbursementTransferId: transfer.id,
        installments: { create: quote.schedule },
      },
    });
    return loan.id;
  });
}

/**
 * Pay some or all of a loan from Flow. The payment settles installments
 * oldest-first; paying the last kobo closes the loan.
 */
export async function repayLoan(
  userId: string,
  input: LoanRepaymentInput,
): Promise<LoanResult> {
  const amountMinor = parseAmountToMinor(input.amount);

  return runLoanTx(input.idempotencyKey, async (tx) => {
    await lockUser(tx, userId);

    const loan = await tx.loan.findFirst({
      where: { id: input.loanId, userId, status: "ACTIVE" },
      include: { installments: { orderBy: { sequence: "asc" } } },
    });
    if (!loan) throw new LoanError("That loan is already paid off");

    const outstanding = loan.totalMinor - loan.repaidMinor;
    const amountError = repaymentAmountError(amountMinor, outstanding);
    if (amountError || amountMinor === null) {
      throw new LoanError(amountError ?? "Enter a valid amount");
    }

    // Conditional debit: can't overdraw even if a transfer lands mid-flight.
    const debited = await tx.account.updateMany({
      where: { id: loan.accountId, userId, balanceMinor: { gte: amountMinor } },
      data: { balanceMinor: { decrement: amountMinor } },
    });
    if (debited.count === 0) {
      throw new LoanError("Not enough in your Flow account");
    }
    await tx.account.update({
      where: { id: LENDING_ACCOUNT_ID },
      data: { balanceMinor: { increment: amountMinor } },
    });

    const transfer = await tx.transfer.create({
      data: {
        fromAccountId: loan.accountId,
        toAccountId: LENDING_ACCOUNT_ID,
        amountMinor,
        note: "Loan repayment",
        idempotencyKey: input.idempotencyKey,
      },
    });

    for (const a of allocateRepayment(loan.installments, amountMinor)) {
      await tx.loanInstallment.update({
        where: { id: a.id },
        data: {
          paidMinor: { increment: a.applyMinor },
          ...(a.settles ? { paidAt: transfer.createdAt } : {}),
        },
      });
    }

    const paidOff = amountMinor === outstanding;
    await tx.loan.update({
      where: { id: loan.id },
      data: {
        repaidMinor: { increment: amountMinor },
        ...(paidOff ? { status: "REPAID", closedAt: transfer.createdAt } : {}),
      },
    });
    await tx.loanRepayment.create({
      data: { loanId: loan.id, transferId: transfer.id, amountMinor },
    });
    return loan.id;
  });
}

/** Run a loan write once per idempotency key; map failures to messages. */
async function runLoanTx(
  idempotencyKey: string,
  work: (tx: Prisma.TransactionClient) => Promise<string>,
): Promise<LoanResult> {
  const alreadyDone = async () => {
    const t = await findLoanIdByTransferKey(idempotencyKey);
    return t?.loanDisbursement?.id ?? t?.loanRepayment?.loanId ?? null;
  };

  const done = await alreadyDone();
  if (done) return { ok: true, loanId: done };

  try {
    return { ok: true, loanId: await db.$transaction(work) };
  } catch (err) {
    if (err instanceof LoanError) return { ok: false, error: err.message };
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const raced = await alreadyDone();
      if (raced) return { ok: true, loanId: raced };
    }
    return {
      ok: false,
      error: "Could not complete that. Nothing was charged.",
    };
  }
}
