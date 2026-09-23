import "server-only";
import { db } from "@/lib/db";

/**
 * GRID's lending house account, created by the pin_and_loans migration.
 * Loans are paid out of it and repaid into it as ordinary transfers.
 */
export const LENDING_ACCOUNT_ID = "acct_grid_lending";

/** GRID's bill-payments house account (airtime, data). */
export const BILLS_ACCOUNT_ID = "acct_grid_bills";

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
