import Link from "next/link";
import { signOutAction } from "@/app/(app)/actions";

export function AppHeader({ userName }: { userName: string }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-serif text-lg tracking-tight">
            GRID
          </Link>
          <nav className="flex items-center gap-4 text-sm text-ink-soft">
            <Link href="/dashboard" className="hover:text-ink">
              Dashboard
            </Link>
            <Link href="/transfer" className="hover:text-ink">
              Move money
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-ink-soft">
          <span className="hidden sm:inline">{userName}</span>
          <form action={signOutAction}>
            <button type="submit" className="hover:text-ink">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
