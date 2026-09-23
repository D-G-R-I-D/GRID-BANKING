"use client";

import { useRouter } from "next/navigation";

function ArrowLeft({ size = 18 }: { size?: number }) {
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
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function TopUpHeader({
  title,
  backHref,
  hideClose = false,
}: {
  title: string;
  backHref: string;
  hideClose?: boolean;
}) {
  const router = useRouter();

  return (
    <div className="mb-6 flex items-center gap-3">
      <button
        type="button"
        onClick={() => router.push(backHref)}
        aria-label="Go back"
        className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-surface-sunk hover:text-ink"
      >
        <ArrowLeft size={18} />
      </button>
      <h1 className="text-xl">{title}</h1>
      {!hideClose && (
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="ml-auto text-lg leading-none text-ink-faint hover:text-ink"
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  );
}
