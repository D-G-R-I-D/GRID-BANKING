import { requireUser } from "@/lib/session";
import { getDashboard } from "@/lib/services/dashboard-service";
import { AmountClient } from "./amount-client";

export default async function AirtimeAmountPage({
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

  return (
    <AmountClient
      phone={phone}
      network={network}
      balanceMinor={view.totalMinor}
    />
  );
}
