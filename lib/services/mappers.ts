import type { Account, Transfer } from "@prisma/client";
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
  transfer: Transfer,
  ownedAccountIds: Set<string>,
  accountNameById: Map<string, string>,
): ActivityView {
  const outgoing = ownedAccountIds.has(transfer.fromAccountId);
  return {
    id: transfer.id,
    at: transfer.createdAt,
    note: transfer.note,
    amountMinor: outgoing ? -transfer.amountMinor : transfer.amountMinor,
    currency: transfer.currency,
    direction: outgoing ? "out" : "in",
    counterparty: outgoing
      ? (accountNameById.get(transfer.toAccountId) ?? "External")
      : (accountNameById.get(transfer.fromAccountId) ?? "External"),
  };
}
