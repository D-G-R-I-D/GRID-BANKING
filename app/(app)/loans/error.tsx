"use client";

import { Button } from "@/components/ui/button";

export default function LoansError({ reset }: { reset: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-md border border-line bg-surface p-6 text-center"
    >
      <p className="text-sm text-ink">We couldn&rsquo;t load your loans.</p>
      <Button variant="ghost" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
