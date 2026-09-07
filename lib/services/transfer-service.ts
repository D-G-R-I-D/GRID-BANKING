import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { parseAmountToMinor } from "@/lib/money";
import { toAccountView } from "@/lib/services/mappers";
import { listAccountsByUser } from "@/lib/data/accounts";
import { findTransferByIdempotencyKey } from "@/lib/data/transfers";
import { findRecipientByAccountNumber } from "@/lib/data/users";
import type {
  ExternalTransferInput,
  InternalTransferInput,
} from "@/lib/validation";
import type { RecipientView, TransferTargetsView } from "@/lib/view";

export type TransferResult =
  { ok: true; transferId: string } | { ok: false; error: string };

class TransferError extends Error {}

export async function getTransferTargets(
  userId: string,
): Promise<TransferTargetsView> {
  const accounts = await listAccountsByUser(userId);
  return { accounts: accounts.map(toAccountView) };
}

/** Preview a recipient before sending — returns their name, or null. */
export async function lookupRecipient(
  senderId: string,
  accountNumber: string,
): Promise<RecipientView | null> {
  const user = await findRecipientByAccountNumber(accountNumber);
  if (!user || user.accounts.length === 0) return null;
  if (user.id === senderId) return null;
  return { name: user.name, accountNumber };
}

/** Move money between two accounts the sender owns (Flow <-> Vault). */
export async function submitInternalTransfer(
  userId: string,
  input: InternalTransferInput,
): Promise<TransferResult> {
  if (input.fromAccountId === input.toAccountId) {
    return { ok: false, error: "Choose two different accounts" };
  }
  const amountMinor = parseAmountToMinor(input.amount);
  if (amountMinor === null || amountMinor <= 0) {
    return { ok: false, error: "Enter a valid amount, e.g. 25.00" };
  }

  return runTransfer(input.idempotencyKey, async (tx) => {
    const [from, to] = await Promise.all([
      tx.account.findFirst({ where: { id: input.fromAccountId, userId } }),
      tx.account.findFirst({ where: { id: input.toAccountId, userId } }),
    ]);
    if (!from || !to) throw new TransferError("Account not found");
    return { from, to, amountMinor, note: input.note };
  });
}

/** Send money from the sender's Flow account to another person's Flow account. */
export async function submitExternalTransfer(
  userId: string,
  input: ExternalTransferInput,
): Promise<TransferResult> {
  const amountMinor = parseAmountToMinor(input.amount);
  if (amountMinor === null || amountMinor <= 0) {
    return { ok: false, error: "Enter a valid amount, e.g. 25.00" };
  }

  const recipient = await findRecipientByAccountNumber(
    input.recipientAccountNumber,
  );
  const recipientFlowId = recipient?.accounts[0]?.id;
  if (!recipient || !recipientFlowId) {
    return { ok: false, error: "No GRID account with that number" };
  }
  if (recipient.id === userId) {
    return { ok: false, error: "You can't send money to yourself" };
  }

  return runTransfer(input.idempotencyKey, async (tx) => {
    const from = await tx.account.findFirst({
      where: { userId, kind: "FLOW" },
    });
    const to = await tx.account.findUnique({ where: { id: recipientFlowId } });
    if (!from || !to) throw new TransferError("Account not found");
    return { from, to, amountMinor, note: input.note };
  });
}

// --- shared execution ---------------------------------------------------

type Resolve = (tx: Prisma.TransactionClient) => Promise<{
  from: { id: string; currency: string; balanceMinor: number };
  to: { id: string; currency: string };
  amountMinor: number;
  note?: string;
}>;

async function runTransfer(
  idempotencyKey: string,
  resolve: Resolve,
): Promise<TransferResult> {
  try {
    const transfer = await db.$transaction(async (tx) => {
      const existing = await tx.transfer.findUnique({
        where: { idempotencyKey },
      });
      if (existing) return existing;

      const { from, to, amountMinor, note } = await resolve(tx);
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
          idempotencyKey,
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
      const done = await findTransferByIdempotencyKey(idempotencyKey);
      if (done) return { ok: true, transferId: done.id };
    }
    return { ok: false, error: "Could not complete the transfer" };
  }
}
