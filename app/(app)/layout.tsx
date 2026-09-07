import { requireUser } from "@/lib/session";
import { initials } from "@/lib/name";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader initials={initials(user.name)} />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-5">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
