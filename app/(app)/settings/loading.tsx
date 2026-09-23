export default function Loading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
      <div className="skeleton h-7 w-1/3 rounded-md" />
      <div className="skeleton h-10 rounded-full" />
      <div className="skeleton h-16 rounded-md" />
      <div className="skeleton h-16 rounded-md" />
      <div className="skeleton h-16 rounded-md" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
