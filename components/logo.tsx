import { cn } from "@/lib/cn";

/**
 * GRID • PAY mark: a 2×2 grid on the money-card surface with one cell lit
 * in the accent — the grid is GRID, the lit cell is PAY. Token colours, so
 * it follows light/dark. app/icon.svg is the same drawing for the tab icon.
 */
export function LogoMark({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <rect width="32" height="32" rx="8" className="fill-card" />
      <rect
        x="8"
        y="8"
        width="7"
        height="7"
        rx="1.5"
        className="fill-card-ink"
      />
      <rect
        x="17"
        y="8"
        width="7"
        height="7"
        rx="1.5"
        className="fill-card-ink"
      />
      <rect
        x="8"
        y="17"
        width="7"
        height="7"
        rx="1.5"
        className="fill-card-ink"
      />
      <rect
        x="17"
        y="17"
        width="7"
        height="7"
        rx="1.5"
        className="fill-accent"
      />
    </svg>
  );
}

/** The name, set as the brand writes it: GRID • PAY. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-serif tracking-tight", className)}>
      GRID
      <span aria-hidden="true" className="mx-[0.3em] text-accent">
        •
      </span>
      <span className="sr-only"> </span>
      PAY
    </span>
  );
}

/** Mark + name together, for headers. */
export function Logo({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={size} />
      <Wordmark />
    </span>
  );
}
