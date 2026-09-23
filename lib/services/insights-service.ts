import "server-only";
import { bucketByWeek, windowStart } from "@/lib/insights";
import { listTransferAmountsSince } from "@/lib/data/accounts";
import type { CashflowView } from "@/lib/view";

export const CASHFLOW_WEEKS = 6;

/**
 * Money in vs out over the last few weeks. Moves between the user's own
 * accounts (Flow <-> Vault) aren't income or spending, so they're left out.
 */
export async function getCashflow(
  ownedAccountIds: string[],
): Promise<CashflowView> {
  const owned = new Set(ownedAccountIds);
  const rows = await listTransferAmountsSince(
    ownedAccountIds,
    windowStart(CASHFLOW_WEEKS),
  );

  const movements = rows
    .filter((r) => !(owned.has(r.fromAccountId) && owned.has(r.toAccountId)))
    .map((r) => ({
      at: r.createdAt,
      amountMinor: owned.has(r.toAccountId) ? r.amountMinor : -r.amountMinor,
    }));

  const weeks = bucketByWeek(movements, CASHFLOW_WEEKS);
  return {
    weeks,
    inMinor: weeks.reduce((s, w) => s + w.inMinor, 0),
    outMinor: weeks.reduce((s, w) => s + w.outMinor, 0),
  };
}
