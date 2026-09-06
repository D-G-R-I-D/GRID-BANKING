import type { ComponentProps } from "react";

export function Card({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      className={`rounded-lg border border-line bg-surface p-5 ${className}`}
      {...props}
    />
  );
}
