import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "./db";

export type TransferResult =
  { ok: true; transferId: string } | { ok: false; error: string };

interface CreateTransferArgs {
  userId: string;
  fromAccountId: string;
  toAccountId: string;
  amountMinor: number;
  note?: string;
  idempotencyKey: string;
}

/**
 * Move money between two accounts the user owns.
 * Runs in a single DB transaction: debit, credit, and the ledger row all
 * commit together or not at all. The idempotency key makes a double submit a
 * no-op rather than a double send.
 */
export async function createTransfer(
  args: CreateTransferArgs,
): Promise<TransferResult> {
  const { userId, fromAccountId, toAccountId, amountMinor, note } = args;

  if (fromAccountId === toAccountId) {
    return { ok: false, error: "Choose two different accounts" };
  }
  if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
    return { ok: false, error: "Enter an amount greater than zero" };
  }

  try {
    const transfer = await db.$transaction(async (tx) => {
      const existing = await tx.transfer.findUnique({
        where: { idempotencyKey: args.idempotencyKey },
      });
      if (existing) return existing;

      const [from, to] = await Promise.all([
        tx.account.findFirst({ where: { id: fromAccountId, userId } }),
        tx.account.findFirst({ where: { id: toAccountId, userId } }),
      ]);
      if (!from || !to) {
        throw new TransferError("Account not found");
      }
      if (from.currency !== to.currency) {
        throw new TransferError("Accounts use different currencies");
      }
      if (from.balanceMinor < amountMinor) {
        throw new TransferError("Not enough funds in that account");
      }

      await tx.account.update({
        where: { id: from.id },
        data: { balanceMinor: { decrement: amountMinor } },
      });
      await tx.account.update({
        where: { id: to.id },
        data: { balanceMinor: { increment: amountMinor } },
      });

      return tx.transfer.create({
        data: {
          fromAccountId: from.id,
          toAccountId: to.id,
          amountMinor,
          currency: from.currency,
          note: note || null,
          idempotencyKey: args.idempotencyKey,
        },
      });
    });

    return { ok: true, transferId: transfer.id };
  } catch (err) {
    if (err instanceof TransferError) return { ok: false, error: err.message };
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      // Two identical submits raced; treat as already done.
      const done = await db.transfer.findUnique({
        where: { idempotencyKey: args.idempotencyKey },
      });
      if (done) return { ok: true, transferId: done.id };
    }
    return { ok: false, error: "Could not complete the transfer" };
  }
}

class TransferError extends Error {}
