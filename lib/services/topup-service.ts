import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { priceTopUp } from "@/lib/topup";
import { BILLS_ACCOUNT_ID, findFlowAccount } from "@/lib/data/accounts";
import { findTransferByIdempotencyKey } from "@/lib/data/transfers";
import type { TopUpInput } from "@/lib/validation";

export type TopUpResult =
  { ok: true; transferId: string } | { ok: false; error: string };

class TopUpError extends Error {}

/** What the user can spend on a top-up: their Flow balance. */
export async function getSpendableBalance(userId: string): Promise<number> {
  const flow = await findFlowAccount(userId);
  return flow?.balanceMinor ?? 0;
}

/**
 * Buy airtime or data from Flow. Priced server-side, debited conditionally
 * (can't overdraw), recorded as a transfer to GRID Bills so it appears in
 * activity with a receipt. One purchase per idempotency key.
 *
 * There's no telco integration yet: the money moves, the airtime doesn't.
 */
export async function buyTopUp(
  userId: string,
  input: TopUpInput,
): Promise<TopUpResult> {
  const priced = priceTopUp(input);
  if (!priced.ok) return priced;
  const { amountMinor, note } = priced.order;

  const done = await findTransferByIdempotencyKey(input.idempotencyKey);
  if (done) return { ok: true, transferId: done.id };

  try {
    const transfer = await db.$transaction(async (tx) => {
      const flow = await tx.account.findFirst({
        where: { userId, kind: "FLOW" },
        select: { id: true },
      });
      if (!flow) throw new TopUpError("Account not found");

      const debited = await tx.account.updateMany({
        where: { id: flow.id, balanceMinor: { gte: amountMinor } },
        data: { balanceMinor: { decrement: amountMinor } },
      });
      if (debited.count === 0) {
        throw new TopUpError("Not enough in your Flow account");
      }
      await tx.account.update({
        where: { id: BILLS_ACCOUNT_ID },
        data: { balanceMinor: { increment: amountMinor } },
      });

      return tx.transfer.create({
        data: {
          fromAccountId: flow.id,
          toAccountId: BILLS_ACCOUNT_ID,
          amountMinor,
          note,
          idempotencyKey: input.idempotencyKey,
        },
      });
    });
    return { ok: true, transferId: transfer.id };
  } catch (err) {
    if (err instanceof TopUpError) return { ok: false, error: err.message };
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const raced = await findTransferByIdempotencyKey(input.idempotencyKey);
      if (raced) return { ok: true, transferId: raced.id };
    }
    return {
      ok: false,
      error: "Could not complete that. Nothing was charged.",
    };
  }
}
