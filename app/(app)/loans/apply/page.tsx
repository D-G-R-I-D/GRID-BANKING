import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUserWithPin } from "@/lib/session";
import { getLoanSnapshot } from "@/lib/services/loan-service";
import { getIdentity } from "@/lib/services/identity-service";
import { LoanApplicationForm } from "./loan-application-form";

export default async function ApplyForLoanPage() {
  const user = await requireUserWithPin();
  // One loan at a time.
  if (await getLoanSnapshot(user.id)) redirect("/loans");
  const identity = await getIdentity(user.id);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link href="/loans" className="text-xs text-accent hover:underline">
          ← Loans
        </Link>
        <h1 className="mt-2 text-xl">Get a loan</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Paid into your Flow account the moment you confirm.
        </p>
      </div>
      <LoanApplicationForm
        pinLength={user.pinLength}
        maxMinor={identity.loanLimitMinor}
        canRaiseLimit={!identity.complete}
      />
    </div>
  );
}
