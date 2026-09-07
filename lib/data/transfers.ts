import "server-only";
import { db } from "@/lib/db";

export function listTransfersForAccounts(accountIds: string[], take: number) {
  return db.transfer.findMany({
    where: {
      OR: [
        { fromAccountId: { in: accountIds } },
        { toAccountId: { in: accountIds } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export function findTransferByIdempotencyKey(idempotencyKey: string) {
  return db.transfer.findUnique({ where: { idempotencyKey } });
}
