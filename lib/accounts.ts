import "server-only";
import { db } from "./db";

/**
 * Every new user gets an Everyday and a Savings account.
 * The Everyday account is opened with a small demo balance so the
 * dashboard and transfers have something to show.
 */
export async function provisionStarterAccounts(userId: string) {
  await db.account.createMany({
    data: [
      { userId, name: "Flow", kind: "FLOW", balanceMinor: 25_000_00 },
      { userId, name: "Vault", kind: "VAULT", balanceMinor: 0 },
    ],
  });
}

export function getAccountsForUser(userId: string) {
  return db.account.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getRecentActivity(userId: string, take = 10) {
  const accounts = await db.account.findMany({
    where: { userId },
    select: { id: true, name: true },
  });
  const ids = accounts.map((a) => a.id);
  const byId = new Map(accounts.map((a) => [a.id, a.name]));

  const transfers = await db.transfer.findMany({
    where: {
      OR: [{ fromAccountId: { in: ids } }, { toAccountId: { in: ids } }],
    },
    orderBy: { createdAt: "desc" },
    take,
  });

  return transfers.map((t) => {
    const outgoing = ids.includes(t.fromAccountId);
    return {
      id: t.id,
      createdAt: t.createdAt,
      note: t.note,
      amountMinor: outgoing ? -t.amountMinor : t.amountMinor,
      currency: t.currency,
      counterparty: outgoing
        ? (byId.get(t.toAccountId) ?? "External")
        : (byId.get(t.fromAccountId) ?? "External"),
    };
  });
}
