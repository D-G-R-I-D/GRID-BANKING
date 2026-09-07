import type { Account } from "@prisma/client";
import type { TransferWithParties } from "@/lib/data/transfers";
import type { AccountView, ActivityView } from "@/lib/view";

export function toAccountView(account: Account): AccountView {
  return {
    id: account.id,
    name: account.name,
    kind: account.kind,
    balanceMinor: account.balanceMinor,
    currency: account.currency,
  };
}

/** Map a transfer to one user's point of view (incoming vs outgoing). */
export function toActivityView(
  transfer: TransferWithParties,
  ownedAccountIds: Set<string>,
): ActivityView {
  const outgoing = ownedAccountIds.has(transfer.fromAccountId);
  const other = outgoing ? transfer.toAccount : transfer.fromAccount;
  const otherIsMine = ownedAccountIds.has(other.id);

  return {
    id: transfer.id,
    at: transfer.createdAt,
    note: transfer.note,
    amountMinor: outgoing ? -transfer.amountMinor : transfer.amountMinor,
    currency: transfer.currency,
    direction: outgoing ? "out" : "in",
    // Between my own accounts -> the account name ("Vault").
    // To/from someone else -> that person's name.
    counterparty: otherIsMine ? other.name : other.user.name,
  };
}
