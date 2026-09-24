"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/toast";
import { TopUpHeader } from "@/components/topup-header";

export default function TopUpPinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const type = searchParams.get("type") ?? "airtime";
  const network = searchParams.get("network") ?? "";
  const phone = searchParams.get("phone") ?? "";
  const planId = searchParams.get("planId") ?? "";

  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const canProceed = pin.length === 4;

  async function handlePurchase(e: FormEvent) {
    e.preventDefault();
    if (!canProceed) return;
    setLoading(true);

    // Simulate API call — replace with your real backend endpoint
    await new Promise((r) => setTimeout(r, 1500));

    setLoading(false);

    const label = type === "airtime" ? "Airtime" : "Data";
    toast(`${label} purchased successfully`);

    const params = new URLSearchParams({ type });
    router.push(`/transfer/topup/success?${params.toString()}`);
  }

  const backHref =
    type === "airtime"
      ? `/transfer/topup/amount?type=airtime&network=${network}&phone=${phone}`
      : `/transfer/topup/data?network=${network}&phone=${phone}&planId=${planId}`;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-5">
      <TopUpHeader title="Enter your PIN" backHref={backHref} />

      <form onSubmit={handlePurchase} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-soft">Enter your 4-digit PIN</span>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="w-full rounded-md border border-line bg-surface px-3 py-2.5 text-center text-lg tracking-[0.5em] text-ink outline-none focus-within:border-accent"
            autoFocus
          />
        </label>

        <button
          type="submit"
          disabled={!canProceed || loading}
          className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink transition-opacity disabled:opacity-40"
        >
          {loading ? "Processing..." : "Confirm"}
        </button>
      </form>
    </div>
  );
}
