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
  const owned = new Set(accounts.map((a) => a.id));

  const transfers = await listTransfersForAccounts([...owned], limit);
  return transfers.map((t) => toActivityView(t, owned));
}
