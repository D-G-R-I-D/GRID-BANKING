import "server-only";
import { db } from "@/lib/db";

export { BILLS_ACCOUNT_ID, LENDING_ACCOUNT_ID } from "@/lib/house-accounts";

export function findFlowAccount(userId: string) {
  return db.account.findFirst({ where: { userId, kind: "FLOW" } });
}

export function listAccountsByUser(userId: string) {
  return db.account.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}

export function findOwnedAccount(userId: string, accountId: string) {
  return db.account.findFirst({ where: { id: accountId, userId } });
}

export function createStarterAccounts(userId: string) {
  return db.account.createMany({
    data: [
      { userId, name: "Flow", kind: "FLOW", balanceMinor: 25_000_00 },
      { userId, name: "Vault", kind: "VAULT", balanceMinor: 0 },
    ],
  });
}

/** Money in/out of these accounts since a date — for the cash-flow chart. */
export function listTransferAmountsSince(accountIds: string[], since: Date) {
  return db.transfer.findMany({
    where: {
      createdAt: { gte: since },
      OR: [
        { fromAccountId: { in: accountIds } },
        { toAccountId: { in: accountIds } },
      ],
    },
    select: {
      fromAccountId: true,
      toAccountId: true,
      amountMinor: true,
      createdAt: true,
    },
  });
}
