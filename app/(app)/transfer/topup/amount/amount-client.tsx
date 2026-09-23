"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/money";
import {
  AIRTIME_MIN_NAIRA,
  airtimeAmountError,
  formatLocalPhone,
} from "@/lib/topup";
import { TopUpHeader } from "@/components/topup-header";

export function AmountClient({
  phone,
  network,
  balanceMinor,
}: {
  phone: string;
  network: string;
  balanceMinor: number;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState("");

  // Whole naira only; "10.5" is an error, not silently ₦10.
  const amountNaira = /^\d+$/.test(amount) ? Number(amount) : null;
  const amountMinor = (amountNaira ?? 0) * 100;
  const amountError = amount === "" ? null : airtimeAmountError(amountNaira);
  const insufficientBalance = amountMinor > balanceMinor;
  const canProceed =
    amount !== "" && amountError === null && !insufficientBalance;

  function handleContinue() {
    if (!canProceed) return;
    const params = new URLSearchParams({
      type: "airtime",
      network,
      phone,
      amount: String(amountNaira),
    });
    router.push(`/transfer/topup/pin?${params.toString()}`);
  }

  return (
    <div className="flex flex-col">
      <TopUpHeader
        title="Enter amount"
        backHref={`/transfer/topup?type=airtime&network=${network}&phone=${phone}`}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleContinue();
        }}
        className="flex flex-col gap-4"
      >
        <div className="rounded-md border border-line bg-surface-sunk px-3 py-2 text-sm text-ink-soft">
          To: {formatLocalPhone(phone)}
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-soft">Amount (₦)</span>
          <div className="flex items-center gap-1 rounded-md border border-line bg-surface px-3 py-2.5 focus-within:border-accent">
            <span className="text-sm text-ink-soft">₦</span>
            <input
              type="number"
              inputMode="numeric"
              min={AIRTIME_MIN_NAIRA}
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
              autoFocus
            />
          </div>
          {amountError && (
            <span className="text-xs text-critical">{amountError}</span>
          )}
          {insufficientBalance && (
            <span className="text-xs text-critical">
              Insufficient balance. You have {formatMoney(balanceMinor, "NGN")}
            </span>
          )}
        </label>

        <div className="flex gap-2">
          {[100, 200, 500, 1000].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setAmount(String(n))}
              className="flex-1 rounded-md border border-line bg-surface px-2 py-2 text-xs text-ink-soft transition-colors hover:bg-surface-sunk hover:text-ink"
            >
              ₦{n.toLocaleString()}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={!canProceed}
          className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink transition-opacity disabled:opacity-40"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
