import "server-only";
import { listAccountsByUser } from "@/lib/data/accounts";
import { listTransfersForAccounts } from "@/lib/data/transfers";
import { toActivityView } from "@/lib/services/mappers";
import type { ActivityView } from "@/lib/view";

export async function getActivity(
  userId: string,
  limit = 20,
): Promise<ActivityView[]> {
  const accounts = await listAccountsByUser(userId);
  const ids = accounts.map((a) => a.id);
  const owned = new Set(ids);
  const nameById = new Map(accounts.map((a) => [a.id, a.name]));

  const transfers = await listTransfersForAccounts(ids, limit);
  return transfers.map((t) => toActivityView(t, owned, nameById));
}
