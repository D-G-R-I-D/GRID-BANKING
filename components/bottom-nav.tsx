"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { ArrowLeftRight, Home, Receipt, User } from "@/components/icons";
import { cn } from "@/lib/cn";

type IconType = ComponentType<{ size?: number; strokeWidth?: number }>;

const tabs: { href: string; label: string; icon: IconType }[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/transfer", label: "Move", icon: ArrowLeftRight },
  { href: "/activity", label: "Activity", icon: Receipt },
  { href: "/settings", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-10 border-t border-line bg-paper/90 backdrop-blur">
      <ul className="mx-auto flex max-w-md">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[0.65rem] transition-colors",
                  active ? "text-accent" : "text-ink-faint hover:text-ink-soft",
                )}
              >
                <Icon size={19} strokeWidth={active ? 2.4 : 1.8} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
