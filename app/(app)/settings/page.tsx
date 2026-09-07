import { requireUser } from "@/lib/session";
import { toProfileView } from "@/lib/services/profile-service";
import { signOutAction } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function SettingsPage() {
  const user = await requireUser();
  const profile = toProfileView(user);

  const rows: { label: string; value: string }[] = [
    { label: "Name", value: profile.name },
    { label: "Email", value: profile.email },
    { label: "Phone", value: profile.phone },
    { label: "Account number", value: profile.accountNumberMasked },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl">Profile</h1>

      <dl className="overflow-hidden rounded-md border border-line bg-surface">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 border-b border-line px-4 py-3 last:border-b-0"
          >
            <dt className="shrink-0 text-sm text-ink-soft">{row.label}</dt>
            <dd className="tnum truncate text-sm text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-ink">Appearance</p>
        <ThemeToggle />
      </div>

      <form action={signOutAction}>
        <Button type="submit" variant="ghost" size="lg">
          Sign out
        </Button>
      </form>
    </div>
  );
}
