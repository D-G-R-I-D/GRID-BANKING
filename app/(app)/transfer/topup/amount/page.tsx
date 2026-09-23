import { requireUserWithPin } from "@/lib/session";
import { getSpendableBalance } from "@/lib/services/topup-service";
import { AmountClient } from "./amount-client";

export default async function AirtimeAmountPage({
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

  return (
    <AmountClient phone={phone} network={network} balanceMinor={balanceMinor} />
  );
}
