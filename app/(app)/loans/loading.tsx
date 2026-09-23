export default function LoansLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <div className="skeleton h-12 w-2/3 rounded-md" />
      <div className="skeleton h-48 rounded-lg" />
      <div className="skeleton h-32 rounded-md" />
      <div className="skeleton h-40 rounded-md" />
      <span className="sr-only">Loading your loans</span>
    </div>
  );
}
