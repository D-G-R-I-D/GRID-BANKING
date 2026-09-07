import Link from "next/link";
import type { ComponentType } from "react";
import { ArrowUpRight, Lock, Plus, Sparkle } from "@/components/icons";

type IconType = ComponentType<{ size?: number; className?: string }>;

const actions: { href: string; label: string; icon: IconType }[] = [
  { href: "/transfer", label: "Send", icon: ArrowUpRight },
  { href: "/transfer?to=vault", label: "To Vault", icon: Lock },
  { href: "/dashboard", label: "Top up", icon: Plus },
  { href: "/dashboard", label: "Plan", icon: Sparkle },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {actions.map(({ href, label, icon: Icon }) => (
        <Link
          key={label}
          href={href}
          className="flex flex-col items-center gap-2 rounded-md border border-line bg-surface p-3 text-center transition-colors hover:bg-surface-sunk active:scale-[0.98]"
        >
          <Icon size={18} className="text-accent" />
          <span className="text-[0.7rem] leading-tight text-ink-soft">
            {label}
          </span>
        </Link>
      ))}
    </div>
  );
}
