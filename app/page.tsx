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
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-6">
      <header className="flex h-16 items-center justify-between">
        <span className="font-serif text-lg tracking-tight">GRID</span>
        <Link href="/sign-in" className="text-sm text-ink-soft hover:text-ink">
          Sign in
        </Link>
      </header>

      <main className="flex flex-1 flex-col justify-center py-20">
        <h1 className="max-w-xl text-4xl leading-tight">
          A clearer bank for people who take tomorrow seriously.
        </h1>
        <p className="mt-5 max-w-md text-ink-soft">
          GRID is a bank that shows its working — so a good today adds up to a
          good future.
        </p>
        <div className="mt-8">
          <Link href="/sign-up">
            <Button size="md">Open an account</Button>
          </Link>
        </div>

        <dl className="mt-20 grid gap-8 border-t border-line pt-10 sm:grid-cols-3">
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
  );
}
