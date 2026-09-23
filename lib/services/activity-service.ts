import "server-only";
import { listAccountsByUser } from "@/lib/data/accounts";
import {
  findLatestIncomingTransfer,
  listTransfersForAccounts,
} from "@/lib/data/transfers";
import { toActivityView } from "@/lib/services/mappers";
import type { ActivityView, IncomingView } from "@/lib/view";

export async function getActivity(
  userId: string,
  limit = 20,
): Promise<ActivityView[]> {
  const accounts = await listAccountsByUser(userId);
  const owned = new Set(accounts.map((a) => a.id));

  const transfers = await listTransfersForAccounts([...owned], limit);
  return transfers.map((t) => toActivityView(t, owned));
}

export async function getLatestIncoming(
  userId: string,
): Promise<IncomingView | null> {
  const t = await findLatestIncomingTransfer(userId);
  return t
    ? { id: t.id, amountMinor: t.amountMinor, from: t.fromAccount.user.name }
    : null;
}
