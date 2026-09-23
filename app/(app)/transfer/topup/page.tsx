"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/toast";
import { TopUpHeader } from "@/components/topup-header";
import { NETWORKS } from "@/lib/topup-data";
import { NetworkBadge } from "@/components/network-badge";
import { cn } from "@/lib/cn";
import { findNetwork, isTopUpPhone } from "@/lib/topup";

export default function TopUpDetailsPage() {
  const router = useRouter();
  const { toast } = useToast();

  // "Back" from later steps passes the choices along; start from them.
  const params = useSearchParams();
  const [type, setType] = useState<"airtime" | "data">(
    params.get("type") === "data" ? "data" : "airtime",
  );
  const [network, setNetwork] = useState<string | null>(
    findNetwork(params.get("network") ?? "") ? params.get("network") : null,
  );
  const [phone, setPhone] = useState(
    (params.get("phone") ?? "").replace(/\D/g, "").slice(0, 10),
  );

  const phoneValid = isTopUpPhone(phone);
  const canProceed = network !== null && phoneValid;

  function handleContinue() {
    if (!canProceed) return;
    const params = new URLSearchParams({ type, network: network!, phone });
    router.push(
      `/transfer/topup/${type === "airtime" ? "amount" : "data"}?${params.toString()}`,
    );
  }

  return (
    <div className="flex flex-col">
      <TopUpHeader title="Local Airtime/Data" backHref="/dashboard" />

      <div className="flex flex-col gap-5">
        {/* airtime / data tabs */}
        <div className="flex rounded-md border border-line bg-surface p-1">
          <button
            type="button"
            onClick={() => setType("airtime")}
            aria-pressed={type === "airtime"}
            className={`flex-1 rounded-[4px] py-2 text-sm font-medium transition-colors ${
              type === "airtime"
                ? "bg-paper text-ink shadow-sm"
                : "text-ink-faint"
            }`}
          >
            Airtime
          </button>
          <button
            type="button"
            onClick={() => setType("data")}
            aria-pressed={type === "data"}
            className={`flex-1 rounded-[4px] py-2 text-sm font-medium transition-colors ${
              type === "data" ? "bg-paper text-ink shadow-sm" : "text-ink-faint"
            }`}
          >
            Data
          </button>
        </div>

        {/* phone number */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-soft">
              Phone Number
            </span>
            <button
              type="button"
              onClick={() => toast("Contact picker coming soon")}
              className="text-xs font-medium text-accent hover:underline"
            >
              Select from contacts
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-2.5 focus-within:border-accent">
            <span className="text-sm text-ink-faint">+234</span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="801 234 5678"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
            />
          </div>
          {phone.length === 10 && !phoneValid && (
            <span className="text-xs text-critical">
              That doesn&rsquo;t look like a Nigerian mobile number
            </span>
          )}
          {phone.length > 0 && phone.length < 10 && (
            <span className="text-xs text-critical">
              Enter a valid 10-digit number
            </span>
          )}
        </div>

        {/* network grid */}
        <div className="flex gap-2">
          {NETWORKS.map((n) => {
            const selected = network === n.id;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => setNetwork(n.id)}
                aria-pressed={selected}
                className="group flex flex-1 flex-col items-center gap-1.5 rounded-md py-1 text-xs text-ink-soft"
              >
                <span
                  className={cn(
                    "block rounded-full ring-offset-2 ring-offset-paper transition-[box-shadow,transform] group-active:scale-95",
                    selected
                      ? "ring-2 ring-accent"
                      : "opacity-90 group-hover:opacity-100",
                  )}
                >
                  <NetworkBadge network={n} className="block" />
                </span>
                <span className={selected ? "font-medium text-ink" : undefined}>
                  {n.name}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!canProceed}
          onClick={handleContinue}
          className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink transition-opacity disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
