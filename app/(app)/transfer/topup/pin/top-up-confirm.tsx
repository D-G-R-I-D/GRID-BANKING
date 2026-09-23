"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConfirmStep } from "@/components/confirm-step";
import { MoneyAmount } from "@/components/money-amount";
import { TopUpHeader } from "@/components/topup-header";
import { useToast } from "@/components/toast";
import { usePinAction } from "@/components/use-pin-action";
import { formatMoney } from "@/lib/money";
import { formatLocalPhone, type TopUpKind } from "@/lib/topup";
import type { TransferState } from "../../actions";
import { buyTopUpAction } from "../actions";

const initial: TransferState = {};

export function TopUpConfirm({
  raw,
  summary,
  balanceMinor,
  pinLength,
}: {
  raw: {
    kind: TopUpKind;
    network: string;
    phone: string;
    amount: string;
    planId: string;
  };
  summary: {
    kind: TopUpKind;
    networkName: string;
    phone: string;
    amountMinor: number;
    planLabel: string | null;
  };
  balanceMinor: number;
  pinLength: number;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { state, pinKey, formAction, pending, idempotencyKey } = usePinAction(
    buyTopUpAction,
    initial,
  );
  const label = summary.kind === "airtime" ? "Airtime" : "Data";
  const short = summary.amountMinor > balanceMinor;

  useEffect(() => {
    if (state.transferId) {
      toast(`${label} purchased`);
      router.push(`/transfer/receipt/${state.transferId}`);
    }
  }, [state.transferId, label, router, toast]);

  const backHref =
    raw.kind === "airtime"
      ? `/transfer/topup/amount?network=${raw.network}&phone=${raw.phone}`
      : `/transfer/topup/data?network=${raw.network}&phone=${raw.phone}&planId=${raw.planId}`;

  return (
    <div className="flex flex-col">
      <TopUpHeader
        title={`Confirm ${label.toLowerCase()}`}
        backHref={backHref}
      />

      <form action={formAction}>
        <input
          type="hidden"
          name="idempotencyKey"
          defaultValue={idempotencyKey}
        />
        <input type="hidden" name="kind" value={raw.kind} readOnly />
        <input type="hidden" name="network" value={raw.network} readOnly />
        <input type="hidden" name="phone" value={raw.phone} readOnly />
        <input type="hidden" name="amount" value={raw.amount} readOnly />
        <input type="hidden" name="planId" value={raw.planId} readOnly />

        <ConfirmStep
          title={`Buy ${label.toLowerCase()}`}
          rows={[
            { label: "Network", value: summary.networkName },
            {
              label: "Phone",
              value: (
                <span className="tnum">{formatLocalPhone(summary.phone)}</span>
              ),
            },
            ...(summary.planLabel
              ? [{ label: "Bundle", value: summary.planLabel }]
              : []),
            {
              label: "Amount",
              value: <MoneyAmount minorUnits={summary.amountMinor} />,
            },
            {
              label: "From",
              value: (
                <>
                  Flow ·{" "}
                  <MoneyAmount
                    minorUnits={balanceMinor}
                    className="font-normal"
                  />
                </>
              ),
            },
          ]}
          pinLength={pinLength}
          pinError={state.fieldErrors?.pin}
          pinKey={pinKey}
          error={
            state.error ??
            (short ? "That's more than your Flow account holds" : undefined)
          }
          pending={pending}
          buttonLabel={`Pay ${formatMoney(summary.amountMinor)}`}
          pendingLabel="Paying…"
          footnote="Instant · no fee"
          onBack={() => router.push(backHref)}
        />
      </form>
    </div>
  );
}
