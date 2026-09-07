import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "tinted";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium transition-[transform,background-color,opacity] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink hover:opacity-90",
  ghost: "border border-line text-ink hover:bg-surface-sunk",
  tinted: "bg-surface-sunk text-ink hover:bg-line",
};

const sizes: Record<Size, string> = {
  md: "h-10 px-4 text-sm rounded-md",
  lg: "h-12 px-5 text-[0.95rem] rounded-md w-full",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
