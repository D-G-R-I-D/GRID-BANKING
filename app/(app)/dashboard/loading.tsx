export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <div className="skeleton h-40 rounded-lg" />
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-16 rounded-md" />
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="skeleton h-16 rounded-md" />
        <div className="skeleton h-16 rounded-md" />
      </div>
      <div className="skeleton h-40 rounded-md" />
      <span className="sr-only">Loading your dashboard</span>
    </div>
  );
}
