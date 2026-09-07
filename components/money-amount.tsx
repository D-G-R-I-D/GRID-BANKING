import { DEFAULT_CURRENCY, formatMoney } from "@/lib/money";

interface MoneyAmountProps {
  minorUnits: number;
  currency?: string;
  /** Show a +/- sign and colour for gains/losses. */
  signed?: boolean;
  className?: string;
}

/**
 * The only component that renders money. Always tabular figures.
 */
export function MoneyAmount({
  minorUnits,
  currency = DEFAULT_CURRENCY,
  signed = false,
  className = "",
}: MoneyAmountProps) {
  const formatted = formatMoney(Math.abs(minorUnits), currency);
  const sign = minorUnits < 0 ? "−" : signed ? "+" : "";
  const tone =
    signed && minorUnits !== 0
      ? minorUnits > 0
        ? "text-positive"
        : "text-critical"
      : "text-ink";

  return (
    <span className={`tnum ${tone} ${className}`}>
      {sign}
      {formatted}
    </span>
  );
}
