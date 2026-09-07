"use client";

import { useSyncExternalStore } from "react";
import { Sparkle } from "@/components/icons";

/**
 * Dismissible promo card. Content is static for now; a real feed would come
 * from the backend. Dismissal is remembered per-viewer in localStorage.
 */

const ANNOUNCEMENT = {
  id: "vault-yield-2026",
  title: "Your Vault will soon earn 9%/yr",
  body: "Move money to Vault now — balances there start earning when it launches.",
};

const KEY = `grid-dismissed-${ANNOUNCEMENT.id}`;

function subscribe(cb: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
function getSnapshot() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function AnnouncementCard() {
  const dismissed = useSyncExternalStore(subscribe, getSnapshot, () => true);
  if (dismissed) return null;

  function dismiss() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    // Nudge subscribers in this tab (storage event only fires cross-tab).
    window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
  }

  return (
    <div className="rise flex items-start gap-3 rounded-md border border-line bg-accent-soft p-4">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-accent-ink">
        <Sparkle size={15} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{ANNOUNCEMENT.title}</p>
        <p className="mt-0.5 text-xs text-ink-soft">{ANNOUNCEMENT.body}</p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="-m-1 shrink-0 rounded p-1 text-lg leading-none text-ink-faint hover:text-ink"
      >
        ×
      </button>
    </div>
  );
}
