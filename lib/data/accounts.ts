import "server-only";
import { db } from "@/lib/db";

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
