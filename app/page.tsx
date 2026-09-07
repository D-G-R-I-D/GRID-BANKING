import Link from "next/link";
import { Button } from "@/components/ui/button";

const promises = [
  {
    title: "A good today",
    body: "Every number explained. No buried fees, no dark patterns, no noise.",
  },
  {
    title: "A good tomorrow",
    body: "Money that's easy to move, schedule, and see. Safe by default.",
  },
  {
    title: "A good future",
    body: "Understand what today's choices do to next year. Plan with real numbers.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative isolate min-h-dvh overflow-hidden">
      {/* aurora */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[520px] opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(50% 60% at 30% 40%, color-mix(in srgb, var(--accent) 55%, transparent) 0%, transparent 70%), radial-gradient(45% 55% at 80% 20%, color-mix(in srgb, var(--accent) 35%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-6">
        <header className="flex h-16 items-center justify-between">
          <span className="font-serif text-lg tracking-tight">GRID</span>
          <Link
            href="/sign-in"
            className="text-sm text-ink-soft hover:text-ink"
          >
            Sign in
          </Link>
        </header>

        <main className="flex flex-1 flex-col justify-center py-16">
          <div className="rise">
            <h1 className="max-w-xl text-4xl leading-[1.1]">
              A clearer bank for people who take tomorrow seriously.
            </h1>
            <p className="mt-5 max-w-md text-ink-soft">
              GRID shows its working — so a good today adds up to a good future.
            </p>
            <div className="mt-8">
              <Link href="/sign-up">
                <Button size="md">Open an account</Button>
              </Link>
            </div>
          </div>

          {/* card preview */}
          <div className="rise rise-2 mt-14 flex justify-center sm:justify-start">
            <div
              className="w-72 rotate-[-4deg] rounded-lg p-5 text-white shadow-[var(--shadow-md)]"
              style={{
                background:
                  "radial-gradient(120% 120% at 100% 0%, #2b2d5c 0%, #1a1b32 45%, #101018 100%)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[0.7rem] uppercase tracking-widest text-white/50">
                  Balance
                </span>
                <span className="font-serif text-sm text-white/80">GRID</span>
              </div>
              <div className="mt-3 h-6 w-9 rounded bg-gradient-to-br from-[#d8c48a] to-[#a98f4d]" />
              <p className="tnum mt-3 text-2xl">₦ 184,200.00</p>
              <p className="tnum mt-4 text-xs tracking-[0.2em] text-white/70">
                ••• ••• 4567
              </p>
            </div>
          </div>

          <dl className="rise rise-3 mt-16 grid gap-8 border-t border-line pt-10 sm:grid-cols-3">
            {promises.map((p) => (
              <div key={p.title}>
                <dt className="font-serif text-lg">{p.title}</dt>
                <dd className="mt-2 text-sm text-ink-soft">{p.body}</dd>
              </div>
            ))}
          </dl>
        </main>

        <footer className="border-t border-line py-6 text-xs text-ink-faint">
          GRID is a student project, not a licensed financial service.
        </footer>
      </div>
    </div>
  );
}
