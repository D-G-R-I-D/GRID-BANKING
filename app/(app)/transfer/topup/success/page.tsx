"use client";

import { useRouter, useSearchParams } from "next/navigation";

function CheckCircle({ size = 28 }: { size?: number }) {
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
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

export default function TopUpSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? "airtime";

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-4 py-5 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-accent/10 text-accent">
        <CheckCircle size={28} />
      </span>
      <p className="text-sm text-ink-soft">
        Your {type === "airtime" ? "airtime" : "data"} purchase was successful.
      </p>
      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink"
      >
        Done
      </button>
    </div>
  );
}
