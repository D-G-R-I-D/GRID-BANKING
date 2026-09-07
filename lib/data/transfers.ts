import "server-only";
import { db } from "@/lib/db";

const counterpartySelect = {
  select: {
    id: true,
    name: true,
    user: { select: { name: true } },
  },
} as const;

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
    include: {
      fromAccount: counterpartySelect,
      toAccount: counterpartySelect,
    },
  });
}

export type TransferWithParties = Awaited<
  ReturnType<typeof listTransfersForAccounts>
>[number];

export function findTransferByIdempotencyKey(idempotencyKey: string) {
  return db.transfer.findUnique({ where: { idempotencyKey } });
}
