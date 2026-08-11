export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
      <div className="h-28 w-full animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}
