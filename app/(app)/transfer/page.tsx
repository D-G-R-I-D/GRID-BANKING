import { requireUser } from "@/lib/session";
import { getAccountsForUser } from "@/lib/accounts";
import { TransferForm } from "./transfer-form";

export default async function TransferPage() {
  const user = await requireUser();
  const accounts = await getAccountsForUser(user.id);

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl">Move money</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Between your own accounts. Instant, no fee.
      </p>
      <div className="mt-8">
        <TransferForm
          accounts={accounts.map((a) => ({
            id: a.id,
            name: a.name,
            balanceMinor: a.balanceMinor,
            currency: a.currency,
          }))}
        />
      </div>
    </div>
  );
}
