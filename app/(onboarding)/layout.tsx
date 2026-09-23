import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Signed in, but not yet allowed into the app (no PIN). */
export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (user.pinLength !== null) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-6 py-16">
      <p className="mb-8 font-serif text-xl tracking-tight text-ink">GRID</p>
      {children}
    </main>
  );
}
