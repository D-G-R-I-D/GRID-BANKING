import type { Account } from "@prisma/client";
import type { TransferWithParties } from "@/lib/data/transfers";
import { BILLS_ACCOUNT_ID, LENDING_ACCOUNT_ID } from "@/lib/house-accounts";
import type { AccountView, ActivityKind, ActivityView } from "@/lib/view";

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
    kind: activityKind(other.id, otherIsMine),
  };
}

function activityKind(
  otherAccountId: string,
  otherIsMine: boolean,
): ActivityKind {
  if (otherIsMine) return "internal";
  if (otherAccountId === LENDING_ACCOUNT_ID) return "loan";
  if (otherAccountId === BILLS_ACCOUNT_ID) return "bills";
  return "transfer";
}
