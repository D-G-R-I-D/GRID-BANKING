import { requireUser } from "@/lib/session";
import { getDashboard } from "@/lib/services/dashboard-service";
import { DataClient } from "./data-client";

export default async function BuyDataPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const user = await requireUser();
  const view = await getDashboard(user.id, {
    name: user.name,
    accountNumber: user.accountNumber,
  });

  const phone = typeof params.phone === "string" ? params.phone : "";
  const network = typeof params.network === "string" ? params.network : "";
  const planId = typeof params.planId === "string" ? params.planId : "";

  return (
    <DataClient phone={phone} network={network} planId={planId} balanceMinor={view.totalMinor} />
  );
}
