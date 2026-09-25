import Link from "next/link";
import { requireUserWithPin } from "@/lib/session";
import { getIdentity } from "@/lib/services/identity-service";
import { Check, Lock } from "@/components/icons";
import { MoneyAmount } from "@/components/money-amount";
import { LOAN_MAX_MINOR, LOAN_MAX_VERIFIED_MINOR } from "@/lib/loan";
import { IdentityForm } from "./identity-form";

export default async function IdentityPage() {
  const user = await requireUserWithPin();
  const identity = await getIdentity(user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/settings" className="text-xs text-accent hover:underline">
          ← Profile
        </Link>
        <h1 className="mt-2 text-xl">BVN &amp; NIN</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Optional. Add both to unlock higher limits.
        </p>
      </div>

      <div className="rounded-lg border border-line bg-surface p-4">
        <p className="text-sm font-medium text-ink">
          {identity.complete ? "Higher limits unlocked" : "What you unlock"}
        </p>
        <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-soft">
          <li className="flex items-center justify-between gap-3">
            <span>Loan limit</span>
            <span className="text-right">
              <MoneyAmount
                minorUnits={LOAN_MAX_MINOR}
                className="text-ink-faint line-through"
              />{" "}
              →{" "}
              <MoneyAmount
                minorUnits={LOAN_MAX_VERIFIED_MINOR}
                className="font-medium"
              />
            </span>
          </li>
          <li className="flex items-center gap-2">
            <Check size={14} className="text-positive" /> Only the last 4 digits
            are ever shown
          </li>
          <li className="flex items-center gap-2">
            <Lock size={14} className="text-ink-faint" /> We never store the
            full number
          </li>
        </ul>
      </div>

      <IdentityForm
        bvnLast4={identity.bvnLast4}
        ninLast4={identity.ninLast4}
        pinLength={user.pinLength}
      />

      <p className="text-xs text-ink-faint">
        Numbers are checked for format only; GRID • PAY isn&rsquo;t connected to
        NIBSS or NIMC, so this is not identity verification.
      </p>
    </div>
  );
}
