import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { parseAmountToMinor } from "@/lib/money";
import { toAccountView } from "@/lib/services/mappers";
import { listAccountsByUser } from "@/lib/data/accounts";
import { findTransferByIdempotencyKey } from "@/lib/data/transfers";
import type { TransferInput } from "@/lib/validation";
import type { TransferTargetsView } from "@/lib/view";

export type TransferResult =
  | { ok: true; transferId: string }
  | { ok: false; error: string };

export async function getTransferTargets(
  userId: string,
): Promise<TransferTargetsView> {
  const accounts = await listAccountsByUser(userId);
  return { accounts: accounts.map(toAccountView) };
}

/**
 * Validate and execute a transfer between two accounts the user owns.
 * Debit, credit and the ledger row commit together or not at all. The
 * idempotency key makes a double submit a no-op, not a double send.
 */
export async function submitTransfer(
  userId: string,
  input: TransferInput,
): Promise<TransferResult> {
  if (input.fromAccountId === input.toAccountId) {
    return { ok: false, error: "Choose two different accounts" };
  }

  const amountMinor = parseAmountToMinor(input.amount);
  if (amountMinor === null || amountMinor <= 0) {
    return { ok: false, error: "Enter a valid amount, e.g. 25.00" };
  }

  try {
    const transfer = await db.$transaction(async (tx) => {
      const existing = await tx.transfer.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (existing) return existing;

      const [from, to] = await Promise.all([
        tx.account.findFirst({ where: { id: input.fromAccountId, userId } }),
        tx.account.findFirst({ where: { id: input.toAccountId, userId } }),
      ]);
      if (!from || !to) throw new TransferError("Account not found");
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
          note: input.note || null,
          idempotencyKey: input.idempotencyKey,
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
      const done = await findTransferByIdempotencyKey(input.idempotencyKey);
      if (done) return { ok: true, transferId: done.id };
    }
    return { ok: false, error: "Could not complete the transfer" };
  }
}

class TransferError extends Error {}
