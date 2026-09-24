"use client";

import { useState, useEffect, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useToast } from "@/components/toast";
import { formatMoney } from "@/lib/money";
/* ------------------------------------------------------------------ */
/*  Inline icons (matching the style from icons.tsx)                   */
/* ------------------------------------------------------------------ */

function Icon({
  children,
  size = 20,
  className = "",
}: {
  children: React.ReactNode;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

const ArrowLeft = (p: { size?: number; className?: string }) => (
  <Icon {...p}>
    <path d="m15 18-6-6 6-6" />
  </Icon>
);

const CheckCircle = (p: { size?: number; className?: string }) => (
  <Icon {...p}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </Icon>
);

/* ------------------------------------------------------------------ */
/*  Networks                                                           */
/* ------------------------------------------------------------------ */

const NETWORKS = [
  { id: "mtn", name: "MTN", initials: "MTN", bg: "#FFCC08", fg: "#000000" },
  { id: "airtel", name: "Airtel", initials: "A", bg: "#ED1C24", fg: "#FFFFFF" },
  { id: "glo", name: "Glo", initials: "G", bg: "#00A651", fg: "#FFFFFF" },
  { id: "9mobile", name: "9mobile", initials: "9", bg: "#00A99D", fg: "#FFFFFF" },
];

/* ------------------------------------------------------------------ */
/*  Nigerian data plans                                               */
/* ------------------------------------------------------------------ */

interface DataPlan {
  id: string;
  network: string;
  data: string;
  priceNaira: number;
  validity: string;
}

const DATA_PLANS: DataPlan[] = [
  { id: "mtn-500mb", network: "MTN", data: "500 MB", priceNaira: 300, validity: "30 days" },
  { id: "mtn-1.5gb", network: "MTN", data: "1.5 GB", priceNaira: 500, validity: "30 days" },
  { id: "mtn-3gb", network: "MTN", data: "3 GB", priceNaira: 1000, validity: "30 days" },
  { id: "mtn-6gb", network: "MTN", data: "6 GB", priceNaira: 1500, validity: "30 days" },
  { id: "glo-1gb", network: "Glo", data: "1 GB", priceNaira: 400, validity: "30 days" },
  { id: "glo-3gb", network: "Glo", data: "3 GB", priceNaira: 900, validity: "30 days" },
  { id: "glo-8gb", network: "Glo", data: "8 GB", priceNaira: 1500, validity: "30 days" },
  { id: "airtel-750mb", network: "Airtel", data: "750 MB", priceNaira: 350, validity: "30 days" },
  { id: "airtel-2gb", network: "Airtel", data: "2 GB", priceNaira: 600, validity: "30 days" },
  { id: "airtel-4.5gb", network: "Airtel", data: "4.5 GB", priceNaira: 1200, validity: "30 days" },
  { id: "9mobile-1gb", network: "9mobile", data: "1 GB", priceNaira: 400, validity: "30 days" },
  { id: "9mobile-2.5gb", network: "9mobile", data: "2.5 GB", priceNaira: 800, validity: "30 days" },
];

/* ------------------------------------------------------------------ */
/*  Types & steps                                                     */
/* ------------------------------------------------------------------ */

type Step = "details" | "amount" | "plan" | "bundle-picker" | "pin" | "success";
type TopUpType = "airtime" | "data" | null;

interface TopUpFlowProps {
  open: boolean;
  onClose: () => void;
  balanceMinor: number;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function TopUpFlow({ open, onClose, balanceMinor }: TopUpFlowProps) {
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("details");
  const [type, setType] = useState<TopUpType>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [balanceHidden, setBalanceHidden] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  /* ---- helpers ---- */

  const selectedPlan = DATA_PLANS.find((p) => p.id === selectedPlanId);
  const amountNaira = parseInt(amount, 10) || 0;
  const amountMinor = amountNaira * 100;
  const amountError =
    type === "airtime" && step === "amount" && amountNaira > 0 && amountNaira < 50;
  const insufficientBalance = type === "airtime" && amountMinor > balanceMinor;
  const planPriceMinor = selectedPlan ? selectedPlan.priceNaira * 100 : 0;
  const insufficientForPlan =
    type === "data" && selectedPlan && planPriceMinor > balanceMinor;

  function reset() {
    setStep("details");
    setType(null);
    setNetwork(null);
    setPhone("");
    setAmount("");
    setSelectedPlanId(null);
    setPin("");
  }

  function close() {
    reset();
    onClose();
  }

  function goBack() {
    if (step === "amount" || step === "plan") {
      setStep("details");
    } else if (step === "bundle-picker") {
      setStep("plan");
    } else if (step === "pin") {
      setStep(type === "airtime" ? "amount" : "plan");
    }
  }

  /* ---- purchase ---- */

  async function handlePurchase(e?: FormEvent) {
    e?.preventDefault();
    setLoading(true);

    // Simulate API call — replace with your real backend endpoint
    await new Promise((r) => setTimeout(r, 1500));

    setLoading(false);

    const label = type === "airtime" ? "Airtime" : "Data";
    toast(`${label} purchased successfully`);
    setStep("success");
  }

  /* ---- can proceed checks ---- */

  const canProceedDetails = type !== null && network !== null && phone.length >= 10;
  const canProceedAmount = amountNaira >= 50 && !insufficientBalance;
  const canProceedPlan = selectedPlanId !== null && !insufficientForPlan;
  const canProceedPin = pin.length === 4;

  /* ---- render ---- */

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />

      {/* sheet */}
      <div className="relative z-10 w-full max-w-md rounded-t-2xl border border-line bg-paper p-6 sm:rounded-2xl sm:shadow-2xl animate-in slide-in-from-bottom">
        {/* -------- header -------- */}
        <div className="mb-6 flex items-center gap-3">
          {step !== "details" && step !== "success" && (
            <button
              type="button"
              onClick={goBack}
              aria-label="Go back"
              className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-surface-sunk hover:text-ink"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <h2 className="text-base font-semibold text-ink">
            {step === "details" && "Local Airtime/Data"}
            {step === "amount" && "Enter amount"}
            {step === "plan" && "Buy Data"}
            {step === "bundle-picker" && "Select Data Bundle"}
            {step === "pin" && "Enter your PIN"}
            {step === "success" && "Transaction successful"}
          </h2>
          {step !== "success" && (
            <button
              type="button"
              onClick={close}
              className="ml-auto text-lg leading-none text-ink-faint hover:text-ink"
              aria-label="Close"
            >
              ×
            </button>
          )}
        </div>

        {/* -------- STEP 1: details -------- */}
        {step === "details" && (
          <div className="flex flex-col gap-5">
            {/* airtime / data tabs */}
            <div className="flex rounded-md border border-line bg-surface p-1">
              <button
                type="button"
                onClick={() => setType("airtime")}
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
                className={`flex-1 rounded-[4px] py-2 text-sm font-medium transition-colors ${
                  type === "data"
                    ? "bg-paper text-ink shadow-sm"
                    : "text-ink-faint"
                }`}
              >
                Data
              </button>
            </div>

            {/* phone number */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink-soft">Phone Number</span>
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
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
                />
              </div>
              {phone.length > 0 && phone.length < 10 && (
                <span className="text-xs text-critical">Enter a valid 10-digit number</span>
              )}
            </div>

            {/* network grid */}
            <div className="flex gap-3">
              {NETWORKS.map((n) => {
                const selected = network === n.id;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => setNetwork(n.id)}
                    aria-label={n.name}
                    className={`grid h-12 w-12 place-items-center rounded-full text-xs font-semibold ring-offset-2 ring-offset-paper transition-shadow ${
                      selected ? "ring-2 ring-accent" : ""
                    }`}
                    style={{ backgroundColor: n.bg, color: n.fg }}
                  >
                    {n.initials}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={!canProceedDetails}
              onClick={() => setStep(type === "airtime" ? "amount" : "plan")}
              className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink transition-opacity disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        )}

        {/* -------- STEP 3a: amount (airtime) -------- */}
        {step === "amount" && type === "airtime" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (canProceedAmount) setStep("pin");
            }}
            className="flex flex-col gap-4"
          >
            {/* phone recap */}
            <div className="rounded-md border border-line bg-surface-sunk px-3 py-2 text-sm text-ink-soft">
              To: +234 {phone}
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-ink-soft">Amount (₦)</span>
              <div className="flex items-center gap-1 rounded-md border border-line bg-surface px-3 py-2.5 focus-within:border-accent">
                <span className="text-sm text-ink-soft">₦</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={50}
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
                  autoFocus
                />
              </div>
              {amountError && (
                <span className="text-xs text-critical">Minimum amount is ₦50</span>
              )}
              {insufficientBalance && (
                <span className="text-xs text-critical">
                  Insufficient balance. You have {formatMoney(balanceMinor, "NGN")}
                </span>
              )}
            </label>

            {/* quick amounts */}
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
              disabled={!canProceedAmount}
              className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink transition-opacity disabled:opacity-40"
            >
              Continue
            </button>
          </form>
        )}

        {/* -------- STEP 3b: plan (data) -------- */}
        {step === "plan" && type === "data" && (
          <div className="flex flex-col gap-5">
            {/* network + phone recap */}
            <div className="flex items-center gap-3 rounded-md border border-line bg-surface px-3 py-3">
              <span
                className="grid h-9 w-9 place-items-center rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: NETWORKS.find((n) => n.id === network)?.bg,
                  color: NETWORKS.find((n) => n.id === network)?.fg,
                }}
              >
                {NETWORKS.find((n) => n.id === network)?.initials}
              </span>
              <div>
                <p className="text-sm font-medium text-ink">+234 {phone}</p>
                <p className="text-xs text-ink-faint">
                  {NETWORKS.find((n) => n.id === network)?.name}
                </p>
              </div>
            </div>

            {/* account to debit */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-ink-soft">Account to Debit</span>
              <div className="rounded-md bg-accent px-4 py-3 text-accent-ink">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {balanceHidden ? "₦••••" : formatMoney(balanceMinor, "NGN")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setBalanceHidden((v) => !v)}
                    aria-label="Toggle balance visibility"
                    className="text-accent-ink/70 hover:text-accent-ink"
                  >
                    {balanceHidden ? "👁" : "🙈"}
                  </button>
                </div>
              </div>
            </div>

            {/* bundle selector */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-ink-soft">Data Bundle</span>
              <button
                type="button"
                onClick={() => setStep("bundle-picker")}
                className="flex items-center justify-between rounded-md border border-line bg-surface px-3 py-2.5 text-left text-sm text-ink"
              >
                {selectedPlan ? (
                  `${selectedPlan.data} — ₦${selectedPlan.priceNaira.toLocaleString()} (${selectedPlan.validity})`
                ) : (
                  <span className="text-ink-faint">Select data bundle</span>
                )}
                <span className="text-ink-faint">▾</span>
              </button>
            </div>

            {insufficientForPlan && (
              <span className="text-xs text-critical">
                Insufficient balance. You have {formatMoney(balanceMinor, "NGN")}
              </span>
            )}

            <button
              type="button"
              onClick={() => canProceedPlan && setStep("pin")}
              disabled={!canProceedPlan}
              className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink transition-opacity disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        )}

        {/* -------- bundle picker overlay -------- */}
        {step === "bundle-picker" && (
          <div className="flex flex-col gap-4">
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {DATA_PLANS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedPlanId(p.id);
                    setStep("plan");
                  }}
                  className="flex w-full items-center justify-between rounded-md border border-line bg-surface px-3 py-3 text-left hover:bg-surface-sunk"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {p.network} — {p.data}
                    </p>
                    <p className="text-xs text-ink-faint">{p.validity}</p>
                  </div>
                  <span className="text-sm font-semibold text-ink">
                    ₦{p.priceNaira.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* -------- STEP 4: pin -------- */}
        {step === "pin" && (
          <form onSubmit={handlePurchase} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-ink-soft">
                Enter your 4-digit PIN
              </span>
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
              disabled={!canProceedPin || loading}
              className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink transition-opacity disabled:opacity-40"
            >
              {loading ? "Processing..." : "Confirm"}
            </button>
          </form>
        )}

        {/* -------- STEP 5: success -------- */}
        {step === "success" && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-accent/10 text-accent">
              <CheckCircle size={28} />
            </span>
            <p className="text-sm text-ink-soft">
              Your {type === "airtime" ? "airtime" : "data"} purchase was successful.
            </p>
            <button
              type="button"
              onClick={close}
              className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
