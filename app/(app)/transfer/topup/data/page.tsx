import { requireUserWithPin } from "@/lib/session";
import { getSpendableBalance } from "@/lib/services/topup-service";
import { DataClient } from "./data-client";

export default async function BuyDataPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const user = await requireUserWithPin();
  // Top-ups are paid from Flow, so that's the balance that matters.
  const balanceMinor = await getSpendableBalance(user.id);

  const phone = typeof params.phone === "string" ? params.phone : "";
  const network = typeof params.network === "string" ? params.network : "";
  const planId = typeof params.planId === "string" ? params.planId : "";

  return (
    <DataClient
      phone={phone}
      network={network}
      planId={planId}
      balanceMinor={balanceMinor}
    />
  );
}
