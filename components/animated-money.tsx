"use client";

import { MoneyAmount } from "@/components/money-amount";
import { useCountUp } from "@/components/use-count-up";

/** <MoneyAmount> that glides to its new value when the amount changes. */
export function AnimatedMoney({
  minorUnits,
  currency,
  className,
  from,
}: {
  minorUnits: number;
  currency?: string;
  className?: string;
  from?: number;
}) {
  const value = useCountUp(minorUnits, from);
  return (
    <MoneyAmount minorUnits={value} currency={currency} className={className} />
  );
}
