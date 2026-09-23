import "server-only";
import { db } from "@/lib/db";

const withSchedule = {
  installments: { orderBy: { sequence: "asc" } },
} as const;

export function listLoansByUser(userId: string) {
  return db.loan.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: withSchedule,
  });
}

export type LoanWithSchedule = Awaited<
  ReturnType<typeof listLoansByUser>
>[number];

export function findActiveLoan(userId: string) {
  return db.loan.findFirst({
    where: { userId, status: "ACTIVE" },
    include: withSchedule,
  });
}

/** The loan a transfer belongs to, if it was a disbursement or repayment. */
export function findLoanIdByTransferKey(idempotencyKey: string) {
  return db.transfer.findUnique({
    where: { idempotencyKey },
    select: {
      loanDisbursement: { select: { id: true } },
      loanRepayment: { select: { loanId: true } },
    },
  });
}
