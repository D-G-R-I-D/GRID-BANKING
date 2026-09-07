import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl">Not found</h1>
      <p className="mt-2 text-sm text-ink-soft">
        That page doesn&apos;t exist.
      </p>
      <Link href="/" className="mt-6 text-sm text-accent underline">
        Back home
      </Link>
    </main>
  );
}
