export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-10" aria-busy="true" aria-live="polite">
      <div className="h-14 w-48 animate-pulse rounded bg-line" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-28 animate-pulse rounded-lg bg-line" />
        <div className="h-28 animate-pulse rounded-lg bg-line" />
      </div>
      <div className="h-40 animate-pulse rounded-lg bg-line" />
      <span className="sr-only">Loading your dashboard</span>
    </div>
  );
}
