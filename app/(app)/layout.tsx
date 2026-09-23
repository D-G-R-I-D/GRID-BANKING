import { requireUserWithPin } from "@/lib/session";
import { initials } from "@/lib/name";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { ToastProvider } from "@/components/toast";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No PIN yet (new sign-up, or an account from before PINs) -> /set-pin.
  const user = await requireUserWithPin();

  return (
    <ToastProvider>
      <div className="flex min-h-dvh flex-col">
        <AppHeader initials={initials(user.name)} />
        <main className="mx-auto w-full max-w-md flex-1 px-4 py-5">
          {children}
        </main>
        <BottomNav />
      </div>
    </ToastProvider>
  );
}
