import Link from "next/link";
import { Logo } from "@/components/logo";

export function AppHeader({ initials }: { initials: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        <Link
          href="/dashboard"
          aria-label="GRID • PAY home"
          className="text-lg"
        >
          <Logo />
        </Link>
        <Link
          href="/settings"
          aria-label="Profile"
          className="grid h-8 w-8 place-items-center rounded-full bg-surface-sunk text-xs font-medium text-ink-soft"
        >
          {initials}
        </Link>
      </div>
    </header>
  );
}
