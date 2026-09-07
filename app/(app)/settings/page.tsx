import { requireUser } from "@/lib/session";
import { toProfileView } from "@/lib/services/profile-service";
import { signOutAction } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col gap-6">
      <h1 className="text-xl">Profile</h1>

      <dl className="overflow-hidden rounded-md border border-line bg-surface">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between border-b border-line px-4 py-3 last:border-b-0"
          >
            <dt className="text-sm text-ink-soft">{row.label}</dt>
            <dd className="tnum text-sm text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>

      <form action={signOutAction}>
        <Button type="submit" variant="ghost" size="lg">
          Sign out
        </Button>
      </form>
    </div>
  );
}
